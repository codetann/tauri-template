import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface MarketplaceModel {
  id: string;
  name: string;
  description: string;
  category: "text" | "image" | "audio" | "video" | "other";
  type: "model" | "lora" | "embedding" | "vae" | "scheduler";
  size: number; // in MB
  downloads: number;
  rating: number;
  tags: string[];
  author: string;
  version: string;
  license: string;
  requirements: string[];
  previewUrl?: string;
  thumbnailUrl?: string;
  downloadUrl: string;
  isDownloaded: boolean;
  isInstalled: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  installedPath?: string;
  metadata?: {
    architecture?: string;
    baseModel?: string;
    resolution?: string;
    trainingSteps?: number;
    dataset?: string;
    framework?: string;
  };
}

export interface ModelCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface InstalledModel {
  id: string;
  name: string;
  category: string;
  type: string;
  version: string;
  installedAt: Date;
  size: number;
  path: string;
  isActive: boolean;
}

interface MarketplaceStore {
  // State
  models: MarketplaceModel[];
  installedModels: InstalledModel[];
  categories: ModelCategory[];
  selectedCategory: string;
  searchQuery: string;
  selectedType: string;
  sortBy: "name" | "size" | "downloads" | "rating" | "date";
  sortOrder: "asc" | "desc";
  viewMode: "grid" | "list";
  isLoading: boolean;
  isDownloading: boolean;
  error: string | null;

  // Actions
  loadModels: () => Promise<void>;
  loadInstalledModels: () => Promise<void>;
  downloadModel: (modelId: string) => Promise<void>;
  installModel: (modelId: string) => Promise<void>;
  uninstallModel: (modelId: string) => Promise<void>;
  importCustomModel: (
    file: File,
    metadata: Partial<MarketplaceModel>
  ) => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: string) => void;
  setSortBy: (
    sortBy: "name" | "size" | "downloads" | "rating" | "date"
  ) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setViewMode: (mode: "grid" | "list") => void;
  clearError: () => void;
}

// Helper function to generate unique model IDs
const generateModelId = () =>
  `model_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useMarketplaceStore = create<MarketplaceStore>((set, get) => ({
  // Initial state
  models: [],
  installedModels: [],
  categories: [
    {
      id: "all",
      name: "All Models",
      description: "Browse all available models",
      icon: "📦",
      count: 0,
    },
    {
      id: "text",
      name: "Text Models",
      description: "Language models for text generation",
      icon: "📝",
      count: 0,
    },
    {
      id: "image",
      name: "Image Models",
      description: "Models for image generation",
      icon: "🎨",
      count: 0,
    },
    {
      id: "audio",
      name: "Audio Models",
      description: "Models for audio generation",
      icon: "🎵",
      count: 0,
    },
    {
      id: "video",
      name: "Video Models",
      description: "Models for video generation",
      icon: "🎬",
      count: 0,
    },
  ],
  selectedCategory: "all",
  searchQuery: "",
  selectedType: "all",
  sortBy: "downloads",
  sortOrder: "desc",
  viewMode: "grid",
  isLoading: false,
  isDownloading: false,
  error: null,

  // Load available models from marketplace
  loadModels: async () => {
    try {
      set({ isLoading: true });

      // Mock data for now - in real implementation, this would call the backend
      const mockModels: MarketplaceModel[] = [
        {
          id: "stable-diffusion-xl",
          name: "Stable Diffusion XL",
          description:
            "High-quality image generation model with 1024x1024 resolution support",
          category: "image",
          type: "model",
          size: 6700,
          downloads: 125000,
          rating: 4.8,
          tags: ["image-generation", "diffusion", "high-resolution"],
          author: "Stability AI",
          version: "1.0",
          license: "CreativeML Open RAIL++-M",
          requirements: ["CUDA 11.8+", "16GB VRAM"],
          downloadUrl:
            "https://example.com/models/stable-diffusion-xl.safetensors",
          isDownloaded: false,
          isInstalled: false,
          isDownloading: false,
          downloadProgress: 0,
          metadata: {
            architecture: "UNet",
            resolution: "1024x1024",
            trainingSteps: 2000000,
            framework: "Diffusers",
          },
        },
        {
          id: "llama-2-7b",
          name: "Llama 2 7B",
          description:
            "Efficient language model for text generation and conversation",
          category: "text",
          type: "model",
          size: 13800,
          downloads: 89000,
          rating: 4.6,
          tags: ["text-generation", "conversation", "llama"],
          author: "Meta",
          version: "2.0",
          license: "Custom Commercial License",
          requirements: ["CUDA 11.8+", "8GB VRAM"],
          downloadUrl: "https://example.com/models/llama-2-7b.gguf",
          isDownloaded: false,
          isInstalled: false,
          isDownloading: false,
          downloadProgress: 0,
          metadata: {
            architecture: "Transformer",
            trainingSteps: 1000000,
            framework: "Transformers",
          },
        },
        {
          id: "musicgen-stereo",
          name: "MusicGen Stereo",
          description: "High-quality music generation from text descriptions",
          category: "audio",
          type: "model",
          size: 3200,
          downloads: 45000,
          rating: 4.5,
          tags: ["music-generation", "audio", "stereo"],
          author: "Meta",
          version: "1.0",
          license: "MIT",
          requirements: ["CUDA 11.8+", "6GB VRAM"],
          downloadUrl: "https://example.com/models/musicgen-stereo.safetensors",
          isDownloaded: false,
          isInstalled: false,
          isDownloading: false,
          downloadProgress: 0,
          metadata: {
            architecture: "EnCodec",
            framework: "Transformers",
          },
        },
        {
          id: "cyberpunk-lora",
          name: "Cyberpunk LoRA",
          description: "LoRA for generating cyberpunk-style images",
          category: "image",
          type: "lora",
          size: 150,
          downloads: 25000,
          rating: 4.7,
          tags: ["cyberpunk", "style", "lora"],
          author: "Community",
          version: "1.2",
          license: "Creative Commons",
          requirements: ["Stable Diffusion Base"],
          downloadUrl: "https://example.com/models/cyberpunk-lora.safetensors",
          isDownloaded: false,
          isInstalled: false,
          isDownloading: false,
          downloadProgress: 0,
          metadata: {
            baseModel: "stable-diffusion-xl",
            framework: "Diffusers",
          },
        },
        {
          id: "anime-lora",
          name: "Anime Style LoRA",
          description: "LoRA for generating anime-style artwork",
          category: "image",
          type: "lora",
          size: 120,
          downloads: 18000,
          rating: 4.4,
          tags: ["anime", "style", "lora"],
          author: "Community",
          version: "1.0",
          license: "Creative Commons",
          requirements: ["Stable Diffusion Base"],
          downloadUrl: "https://example.com/models/anime-lora.safetensors",
          isDownloaded: false,
          isInstalled: false,
          isDownloading: false,
          downloadProgress: 0,
          metadata: {
            baseModel: "stable-diffusion-xl",
            framework: "Diffusers",
          },
        },
      ];

      // Update category counts
      const updatedCategories = get().categories.map((category) => ({
        ...category,
        count:
          category.id === "all"
            ? mockModels.length
            : mockModels.filter((model) => model.category === category.id)
                .length,
      }));

      set({
        models: mockModels,
        categories: updatedCategories,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to load models",
        isLoading: false,
      });
    }
  },

  // Load installed models
  loadInstalledModels: async () => {
    try {
      // Mock installed models - in real implementation, this would scan the models directory
      const mockInstalled: InstalledModel[] = [
        {
          id: "stable-diffusion-xl",
          name: "Stable Diffusion XL",
          category: "image",
          type: "model",
          version: "1.0",
          installedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          size: 6700,
          path: "/models/stable-diffusion-xl.safetensors",
          isActive: true,
        },
        {
          id: "cyberpunk-lora",
          name: "Cyberpunk LoRA",
          category: "image",
          type: "lora",
          version: "1.2",
          installedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          size: 150,
          path: "/models/cyberpunk-lora.safetensors",
          isActive: true,
        },
      ];

      set({ installedModels: mockInstalled });

      // Update model download/install status
      set((state) => ({
        models: state.models.map((model) => {
          const installed = mockInstalled.find(
            (installed) => installed.id === model.id
          );
          return installed
            ? {
                ...model,
                isDownloaded: true,
                isInstalled: true,
                installedPath: installed.path,
              }
            : model;
        }),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to load installed models",
      });
    }
  },

  // Download model
  downloadModel: async (modelId: string) => {
    try {
      set((state) => ({
        models: state.models.map((model) =>
          model.id === modelId
            ? { ...model, isDownloading: true, downloadProgress: 0 }
            : model
        ),
        isDownloading: true,
      }));

      // Simulate download progress
      const progressInterval = setInterval(() => {
        set((state) => ({
          models: state.models.map((model) =>
            model.id === modelId
              ? {
                  ...model,
                  downloadProgress: Math.min(model.downloadProgress + 10, 100),
                }
              : model
          ),
        }));
      }, 200);

      // Simulate download completion
      setTimeout(() => {
        clearInterval(progressInterval);
        set((state) => ({
          models: state.models.map((model) =>
            model.id === modelId
              ? {
                  ...model,
                  isDownloaded: true,
                  isDownloading: false,
                  downloadProgress: 100,
                }
              : model
          ),
          isDownloading: false,
        }));
      }, 2000);

      // In real implementation, this would call the backend to download the model
      // await invoke("download_model", { modelId });
    } catch (error) {
      set((state) => ({
        models: state.models.map((model) =>
          model.id === modelId
            ? { ...model, isDownloading: false, downloadProgress: 0 }
            : model
        ),
        isDownloading: false,
        error:
          error instanceof Error ? error.message : "Failed to download model",
      }));
    }
  },

  // Install model
  installModel: async (modelId: string) => {
    try {
      const model = get().models.find((m) => m.id === modelId);
      if (!model || !model.isDownloaded) return;

      // In real implementation, this would call the backend to install the model
      // await invoke("install_model", { modelId });

      // Add to installed models
      const newInstalledModel: InstalledModel = {
        id: modelId,
        name: model.name,
        category: model.category,
        type: model.type,
        version: model.version,
        installedAt: new Date(),
        size: model.size,
        path: `/models/${model.name.toLowerCase().replace(/\s+/g, "-")}.${
          model.type === "model" ? "safetensors" : "safetensors"
        }`,
        isActive: true,
      };

      set((state) => ({
        installedModels: [...state.installedModels, newInstalledModel],
        models: state.models.map((m) =>
          m.id === modelId
            ? { ...m, isInstalled: true, installedPath: newInstalledModel.path }
            : m
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to install model",
      });
    }
  },

  // Uninstall model
  uninstallModel: async (modelId: string) => {
    try {
      // In real implementation, this would call the backend to uninstall the model
      // await invoke("uninstall_model", { modelId });

      set((state) => ({
        installedModels: state.installedModels.filter(
          (model) => model.id !== modelId
        ),
        models: state.models.map((model) =>
          model.id === modelId
            ? { ...model, isInstalled: false, installedPath: undefined }
            : model
        ),
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to uninstall model",
      });
    }
  },

  // Import custom model
  importCustomModel: async (
    file: File,
    metadata: Partial<MarketplaceModel>
  ) => {
    try {
      const modelId = generateModelId();

      // In real implementation, this would upload the file and create model entry
      // await invoke("import_custom_model", { file, metadata });

      const newModel: MarketplaceModel = {
        id: modelId,
        name: metadata.name || file.name.replace(/\.[^/.]+$/, ""),
        description: metadata.description || "Custom imported model",
        category: metadata.category || "other",
        type: metadata.type || "model",
        size: Math.round(file.size / (1024 * 1024)), // Convert to MB
        downloads: 0,
        rating: 0,
        tags: metadata.tags || ["custom"],
        author: metadata.author || "User",
        version: metadata.version || "1.0",
        license: metadata.license || "Custom",
        requirements: metadata.requirements || [],
        downloadUrl: "",
        isDownloaded: true,
        isInstalled: true,
        isDownloading: false,
        downloadProgress: 100,
        installedPath: `/models/custom/${file.name}`,
        metadata: metadata.metadata,
      };

      set((state) => ({
        models: [newModel, ...state.models],
        installedModels: [
          {
            id: modelId,
            name: newModel.name,
            category: newModel.category,
            type: newModel.type,
            version: newModel.version,
            installedAt: new Date(),
            size: newModel.size,
            path: newModel.installedPath!,
            isActive: true,
          },
          ...state.installedModels,
        ],
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to import custom model",
      });
    }
  },

  // Set selected category
  setSelectedCategory: (category: string) => {
    set({ selectedCategory: category });
  },

  // Set search query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // Set selected type
  setSelectedType: (type: string) => {
    set({ selectedType: type });
  },

  // Set sort by
  setSortBy: (sortBy: "name" | "size" | "downloads" | "rating" | "date") => {
    set({ sortBy });
  },

  // Set sort order
  setSortOrder: (order: "asc" | "desc") => {
    set({ sortOrder: order });
  },

  // Set view mode
  setViewMode: (mode: "grid" | "list") => {
    set({ viewMode: mode });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },
}));
