import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface GeneratedImage {
  id: string;
  prompt: string;
  negativePrompt?: string;
  model: string;
  lora?: string;
  parameters: ImageGenerationParameters;
  imageUrl: string;
  thumbnailUrl?: string;
  status: "generating" | "completed" | "failed";
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface ImageGenerationParameters {
  width: number;
  height: number;
  steps: number;
  guidanceScale: number;
  seed?: number;
  batchSize: number;
  scheduler: string;
  numInferenceSteps: number;
  strength?: number; // For img2img
  controlnet?: {
    model: string;
    weight: number;
    guidance: number;
  };
}

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  model: string;
  lora?: string;
  parameters: ImageGenerationParameters;
  inputImage?: string; // Base64 for img2img
  inputImageMask?: string; // Base64 for inpainting
}

export interface AIModel {
  name: string;
  model_type: string;
  description: string;
  parameters: any;
}

export interface AILora {
  name: string;
  model_type: string;
  description: string;
  strength: number;
}

interface ImageStore {
  // State
  images: GeneratedImage[];
  models: AIModel[];
  loras: AILora[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedModel: string;
  selectedLora: string;
  currentGenerationId: string | null;

  // Actions
  generateImage: (request: ImageGenerationRequest) => Promise<string>;
  getGenerationStatus: (generationId: string) => Promise<void>;
  loadModels: () => Promise<void>;
  loadLoras: () => Promise<void>;
  deleteImage: (imageId: string) => void;
  clearError: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedModel: (model: string) => void;
  setSelectedLora: (lora: string) => void;
  retryGeneration: (imageId: string) => Promise<void>;
}

const generateImageId = () =>
  `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_PARAMETERS: ImageGenerationParameters = {
  width: 512,
  height: 512,
  steps: 20,
  guidanceScale: 7.5,
  batchSize: 1,
  scheduler: "DDIM",
  numInferenceSteps: 20,
};

export const useImageStore = create<ImageStore>((set, get) => ({
  // Initial state
  images: [],
  models: [],
  loras: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  selectedModel: "",
  selectedLora: "",
  currentGenerationId: null,

  // Generate a new image
  generateImage: async (request: ImageGenerationRequest) => {
    try {
      set({ isLoading: true, error: null });

      const imageId = generateImageId();

      // Create placeholder image entry
      const newImage: GeneratedImage = {
        id: imageId,
        prompt: request.prompt,
        negativePrompt: request.negativePrompt,
        model: request.model,
        lora: request.lora,
        parameters: request.parameters,
        imageUrl: "",
        status: "generating",
        createdAt: new Date(),
      };

      set((state) => ({
        images: [newImage, ...state.images],
        currentGenerationId: imageId,
      }));

      // Start generation
      const response = await invoke<{ generation_id: string; status: string }>(
        "generate_content",
        {
          request: {
            model_type: "text-to-image",
            prompt: request.prompt,
            parameters: {
              ...request.parameters,
              negative_prompt: request.negativePrompt,
              lora_name: request.lora,
              input_image: request.inputImage,
              input_image_mask: request.inputImageMask,
            },
            model_name: request.model,
          },
        }
      );

      // Update with generation ID from backend
      set((state) => ({
        images: state.images.map((img) =>
          img.id === imageId ? { ...img, id: response.generation_id } : img
        ),
        currentGenerationId: response.generation_id,
        isLoading: false,
      }));

      return response.generation_id;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to generate image",
        isLoading: false,
      });
      throw error;
    }
  },

  // Get generation status
  getGenerationStatus: async (generationId: string) => {
    try {
      const status = await invoke<{
        success: boolean;
        data?: any;
        error?: string;
        generation_id: string;
        status: string;
      }>("get_generation_status", { generationId });

      set((state) => ({
        images: state.images.map((img) =>
          img.id === generationId
            ? {
                ...img,
                status:
                  status.status === "completed"
                    ? "completed"
                    : status.status === "failed"
                    ? "failed"
                    : "generating",
                imageUrl: status.data?.url || img.imageUrl,
                thumbnailUrl: status.data?.thumbnail_url || img.thumbnailUrl,
                completedAt:
                  status.status === "completed" ? new Date() : img.completedAt,
                error: status.error || img.error,
              }
            : img
        ),
      }));
    } catch (error) {
      console.error("Failed to get generation status:", error);
    }
  },

  // Load available models
  loadModels: async () => {
    try {
      set({ isLoading: true, error: null });
      const models = await invoke<AIModel[]>("get_available_models");
      const imageModels = models.filter(
        (model) => model.model_type === "text-to-image"
      );

      set({
        models: imageModels,
        selectedModel: imageModels.length > 0 ? imageModels[0].name : "",
        isLoading: false,
      });
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
      const imageLoras = loras.filter(
        (lora) => lora.model_type === "text-to-image"
      );
      set({ loras: imageLoras, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load LoRAs",
        isLoading: false,
      });
    }
  },

  // Delete an image
  deleteImage: (imageId: string) => {
    set((state) => ({
      images: state.images.filter((img) => img.id !== imageId),
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set search query
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  // Set selected model
  setSelectedModel: (model: string) => set({ selectedModel: model }),

  // Set selected LoRA
  setSelectedLora: (lora: string) => set({ selectedLora: lora }),

  // Retry a failed generation
  retryGeneration: async (imageId: string) => {
    const state = get();
    const image = state.images.find((img) => img.id === imageId);

    if (!image) return;

    try {
      const request: ImageGenerationRequest = {
        prompt: image.prompt,
        negativePrompt: image.negativePrompt,
        model: image.model,
        lora: image.lora,
        parameters: image.parameters,
      };

      await get().generateImage(request);
    } catch (error) {
      console.error("Failed to retry generation:", error);
    }
  },
}));
