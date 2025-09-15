import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface GeneratedAudio {
  id: string;
  prompt: string;
  model: string;
  generationType: "text-to-audio" | "text-to-speech";
  parameters: {
    duration?: number;
    sampleRate?: number;
    format?: string;
    voice?: string;
    speed?: number;
    pitch?: number;
    volume?: number;
  };
  status: "generating" | "completed" | "failed";
  audioUrl?: string;
  waveformUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  metadata?: {
    duration?: number;
    fileSize?: number;
    format?: string;
  };
}

export interface AudioModel {
  name: string;
  description: string;
  model_type: "text-to-audio" | "text-to-speech";
  capabilities: string[];
  maxDuration?: number;
  supportedFormats?: string[];
}

export interface AudioGenerationRequest {
  prompt: string;
  model: string;
  generationType: "text-to-audio" | "text-to-speech";
  parameters: {
    duration?: number;
    sampleRate?: number;
    format?: string;
    voice?: string;
    speed?: number;
    pitch?: number;
    volume?: number;
  };
}

interface AudioStore {
  // State
  audios: GeneratedAudio[];
  models: AudioModel[];
  selectedModel: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  generateAudio: (request: AudioGenerationRequest) => Promise<void>;
  loadModels: () => Promise<void>;
  deleteAudio: (audioId: string) => void;
  retryGeneration: (audioId: string) => Promise<void>;
  checkGenerationStatus: (audioId: string) => Promise<void>;
  setSelectedModel: (model: string) => void;
  clearError: () => void;
}

// Helper function to generate unique audio IDs
const generateAudioId = () =>
  `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useAudioStore = create<AudioStore>((set, get) => ({
  // Initial state
  audios: [],
  models: [],
  selectedModel: "",
  isLoading: false,
  error: null,

  // Generate audio
  generateAudio: async (request: AudioGenerationRequest) => {
    try {
      set({ isLoading: true, error: null });

      const audioId = generateAudioId();

      // Create placeholder audio entry
      const newAudio: GeneratedAudio = {
        id: audioId,
        prompt: request.prompt,
        model: request.model,
        generationType: request.generationType,
        parameters: request.parameters,
        status: "generating",
        createdAt: new Date(),
      };

      // Add to store immediately
      set((state) => ({
        audios: [newAudio, ...state.audios],
        isLoading: false,
      }));

      // Start generation
      try {
        const result = await invoke("generate_content", {
          request: {
            type: request.generationType,
            prompt: request.prompt,
            model: request.model,
            parameters: request.parameters,
          },
        });

        // Update with result
        set((state) => ({
          audios: state.audios.map((audio) =>
            audio.id === audioId
              ? {
                  ...audio,
                  status: "completed",
                  audioUrl: (result as any)?.url,
                  waveformUrl: (result as any)?.waveform_url,
                  completedAt: new Date(),
                  metadata: (result as any)?.metadata,
                }
              : audio
          ),
        }));
      } catch (error) {
        // Update with error
        set((state) => ({
          audios: state.audios.map((audio) =>
            audio.id === audioId
              ? {
                  ...audio,
                  status: "failed",
                  error:
                    error instanceof Error
                      ? error.message
                      : "Generation failed",
                  completedAt: new Date(),
                }
              : audio
          ),
        }));
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to start generation",
        isLoading: false,
      });
    }
  },

  // Load available models
  loadModels: async () => {
    try {
      set({ isLoading: true });
      const models = await invoke("get_available_models");

      // Filter for audio models
      const audioModels = (models as AudioModel[]).filter(
        (model) =>
          model.model_type === "text-to-audio" ||
          model.model_type === "text-to-speech"
      );

      set({
        models: audioModels,
        selectedModel: audioModels.length > 0 ? audioModels[0].name : "",
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load models",
        isLoading: false,
      });
    }
  },

  // Delete audio
  deleteAudio: (audioId: string) => {
    set((state) => ({
      audios: state.audios.filter((audio) => audio.id !== audioId),
    }));
  },

  // Retry generation
  retryGeneration: async (audioId: string) => {
    const state = get();
    const audio = state.audios.find((audio) => audio.id === audioId);

    if (!audio) return;

    // Reset status and retry
    set((state) => ({
      audios: state.audios.map((audio) =>
        audio.id === audioId
          ? {
              ...audio,
              status: "generating",
              error: undefined,
              completedAt: undefined,
            }
          : audio
      ),
    }));

    // Retry generation
    await state.generateAudio({
      prompt: audio.prompt,
      model: audio.model,
      generationType: audio.generationType,
      parameters: audio.parameters,
    });
  },

  // Check generation status
  checkGenerationStatus: async (audioId: string) => {
    try {
      const status = await invoke("get_generation_status", { id: audioId });

      set((state) => ({
        audios: state.audios.map((audio) =>
          audio.id === audioId
            ? {
                ...audio,
                status:
                  (status as any).status === "completed"
                    ? "completed"
                    : (status as any).status === "failed"
                    ? "failed"
                    : "generating",
                audioUrl: (status as any).data?.url || audio.audioUrl,
                waveformUrl:
                  (status as any).data?.waveform_url || audio.waveformUrl,
                completedAt:
                  (status as any).status === "completed"
                    ? new Date()
                    : audio.completedAt,
                error: (status as any).error || audio.error,
              }
            : audio
        ),
      }));
    } catch (error) {
      console.error("Failed to check generation status:", error);
    }
  },

  // Set selected model
  setSelectedModel: (model: string) => {
    set({ selectedModel: model });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
