import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface GenerationHistory {
  id: string;
  modelType: string;
  prompt: string;
  modelName?: string;
  loraName?: string;
  parameters: any;
  result?: any;
  status: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AIModel {
  name: string;
  modelType: string;
  description: string;
  parameters: any;
}

export interface AILora {
  name: string;
  modelType: string;
  description: string;
  strength: number;
}

interface AIStore {
  // State
  models: AIModel[];
  loras: AILora[];
  generationHistory: GenerationHistory[];
  currentGeneration: GenerationHistory | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadModels: () => Promise<void>;
  loadLoras: () => Promise<void>;
  startGeneration: (request: {
    modelType: string;
    prompt: string;
    parameters: any;
    modelName?: string;
    loraName?: string;
  }) => Promise<string>;
  checkGenerationStatus: (generationId: string) => Promise<void>;
  cancelGeneration: (generationId: string) => Promise<void>;
  clearError: () => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useAIStore = create<AIStore>((set, get) => ({
  // Initial state
  models: [],
  loras: [],
  generationHistory: [],
  currentGeneration: null,
  isLoading: false,
  error: null,

  // Load available models
  loadModels: async () => {
    try {
      set({ isLoading: true, error: null });
      const models = await invoke<AIModel[]>("get_available_models");
      set({ models, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load models",
        isLoading: false,
      });
    }
  },

  // Load available LoRAs
  loadLoras: async () => {
    try {
      set({ isLoading: true, error: null });
      const loras = await invoke<AILora[]>("get_available_loras");
      set({ loras, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load LoRAs",
        isLoading: false,
      });
    }
  },

  // Start a new generation
  startGeneration: async (request) => {
    try {
      set({ isLoading: true, error: null });

      const response = await invoke<{ generation_id: string; status: string }>(
        "generate_content",
        {
          request: {
            model_type: request.modelType,
            prompt: request.prompt,
            parameters: request.parameters,
            model_name: request.modelName,
            lora_name: request.loraName,
          },
        }
      );

      const generation: GenerationHistory = {
        id: response.generation_id,
        modelType: request.modelType,
        prompt: request.prompt,
        modelName: request.modelName,
        loraName: request.loraName,
        parameters: request.parameters,
        status: response.status,
        createdAt: new Date(),
      };

      set((state) => ({
        currentGeneration: generation,
        generationHistory: [generation, ...state.generationHistory],
        isLoading: false,
      }));

      return response.generation_id;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to start generation",
        isLoading: false,
      });
      throw error;
    }
  },

  // Check generation status
  checkGenerationStatus: async (generationId: string) => {
    try {
      const status = await invoke<{
        success: boolean;
        data?: any;
        error?: string;
        generation_id: string;
        status: string;
      }>("get_generation_status", { generationId });

      set((state) => {
        const updatedHistory = state.generationHistory.map((gen) =>
          gen.id === generationId
            ? {
                ...gen,
                status: status.status,
                result: status.data,
                completedAt:
                  status.status === "completed" ? new Date() : gen.completedAt,
              }
            : gen
        );

        const updatedCurrentGeneration =
          state.currentGeneration?.id === generationId
            ? {
                ...state.currentGeneration,
                status: status.status,
                result: status.data,
                completedAt:
                  status.status === "completed"
                    ? new Date()
                    : state.currentGeneration.completedAt,
              }
            : state.currentGeneration;

        return {
          generationHistory: updatedHistory,
          currentGeneration: updatedCurrentGeneration,
        };
      });
    } catch (error) {
      console.error("Failed to check generation status:", error);
    }
  },

  // Cancel a generation
  cancelGeneration: async (generationId: string) => {
    try {
      await invoke("cancel_generation", { generationId });

      set((state) => {
        const updatedHistory = state.generationHistory.map((gen) =>
          gen.id === generationId ? { ...gen, status: "cancelled" } : gen
        );

        const updatedCurrentGeneration =
          state.currentGeneration?.id === generationId
            ? { ...state.currentGeneration, status: "cancelled" }
            : state.currentGeneration;

        return {
          generationHistory: updatedHistory,
          currentGeneration: updatedCurrentGeneration,
        };
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to cancel generation",
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear history
  clearHistory: () => set({ generationHistory: [] }),

  // Remove from history
  removeFromHistory: (id: string) =>
    set((state) => ({
      generationHistory: state.generationHistory.filter((gen) => gen.id !== id),
    })),
}));
