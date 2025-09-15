import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Textarea,
  Chip,
  Progress,
} from "@heroui/react";
import { invoke } from "@tauri-apps/api/core";
import {
  BiImage,
  BiMusic,
  BiVideo,
  BiText,
  BiPlay,
  BiStop,
  BiDownload,
} from "react-icons/bi";

interface ModelInfo {
  name: string;
  model_type: string;
  description: string;
  parameters: any;
}

interface LoraInfo {
  name: string;
  model_type: string;
  description: string;
  strength: number;
}

interface GenerationRequest {
  model_type: string;
  prompt: string;
  parameters: any;
  model_name?: string;
  lora_name?: string;
}

interface GenerationResponse {
  success: boolean;
  data?: any;
  error?: string;
  generation_id: string;
  status: string;
}

const MODEL_TYPES = [
  { key: "text-to-image", label: "Text to Image", icon: BiImage },
  { key: "text-to-audio", label: "Text to Audio", icon: BiMusic },
  { key: "text-to-video", label: "Text to Video", icon: BiVideo },
  { key: "text-generation", label: "Text Generation", icon: BiText },
];

export default function AIGenerationPage() {
  const [selectedModelType, setSelectedModelType] = useState("text-to-image");
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedLora, setSelectedLora] = useState("");
  const [parameters, setParameters] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState("");
  const [generationStatus, setGenerationStatus] =
    useState<GenerationResponse | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loras, setLoras] = useState<LoraInfo[]>([]);
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  useEffect(() => {
    loadModels();
    loadLoras();
  }, []);

  useEffect(() => {
    if (generationId && isGenerating) {
      const interval = setInterval(() => {
        checkGenerationStatus();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [generationId, isGenerating]);

  const loadModels = async () => {
    try {
      const result = await invoke<ModelInfo[]>("get_available_models");
      setModels(result);
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  };

  const loadLoras = async () => {
    try {
      const result = await invoke<LoraInfo[]>("get_available_loras");
      setLoras(result);
    } catch (error) {
      console.error("Failed to load LoRAs:", error);
    }
  };

  const checkGenerationStatus = async () => {
    if (!generationId) return;

    try {
      const status = await invoke<GenerationResponse>("get_generation_status", {
        generationId,
      });

      setGenerationStatus(status);

      if (status.status === "completed") {
        setIsGenerating(false);
        setGeneratedContent(status.data);
      } else if (status.status === "failed" || status.status === "cancelled") {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Failed to check generation status:", error);
    }
  };

  const startGeneration = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedContent(null);

    const request: GenerationRequest = {
      model_type: selectedModelType,
      prompt: prompt.trim(),
      parameters: parameters,
      model_name: selectedModel || undefined,
      lora_name: selectedLora || undefined,
    };

    try {
      const result = await invoke<GenerationResponse>("generate_content", {
        request,
      });

      setGenerationId(result.generation_id);
    } catch (error) {
      console.error("Failed to start generation:", error);
      setIsGenerating(false);
    }
  };

  const cancelGeneration = async () => {
    if (!generationId) return;

    try {
      await invoke("cancel_generation", { generationId });
      setIsGenerating(false);
    } catch (error) {
      console.error("Failed to cancel generation:", error);
    }
  };

  const getDefaultParameters = (modelType: string) => {
    switch (modelType) {
      case "text-to-image":
        return { width: 1024, height: 1024, steps: 50, guidance_scale: 7.5 };
      case "text-to-audio":
        return { voice: "default", speed: 1.0, quality: "high" };
      case "text-to-video":
        return { width: 576, height: 320, frames: 25, fps: 8 };
      case "text-generation":
        return { max_tokens: 2048, temperature: 0.7, top_p: 0.9 };
      default:
        return {};
    }
  };

  const handleModelTypeChange = (value: string) => {
    setSelectedModelType(value);
    setParameters(getDefaultParameters(value));
    setSelectedModel("");
    setSelectedLora("");
  };

  const filteredModels = models.filter(
    (model) => model.model_type === selectedModelType
  );
  const filteredLoras = loras.filter(
    (lora) => lora.model_type === selectedModelType
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "completed":
        return "success";
      case "failed":
        return "danger";
      case "cancelled":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div className="w-full h-full p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h1 className="text-2xl font-bold">AI Generation</h1>
        <Chip color="primary" variant="flat">
          Beta
        </Chip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Generation Controls */}
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-lg font-semibold">Generation Settings</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {/* Model Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Generation Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MODEL_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.key}
                      variant={
                        selectedModelType === type.key ? "solid" : "bordered"
                      }
                      color={
                        selectedModelType === type.key ? "primary" : "default"
                      }
                      className="h-16 flex flex-col gap-1"
                      onPress={() => handleModelTypeChange(type.key)}
                    >
                      <Icon size={20} />
                      <span className="text-xs">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Model Selection */}
            {filteredModels.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <Select
                  placeholder="Select a model"
                  selectedKeys={selectedModel ? [selectedModel] : []}
                  onSelectionChange={(keys) =>
                    setSelectedModel(Array.from(keys)[0] as string)
                  }
                >
                  {filteredModels.map((model) => (
                    <SelectItem key={model.name} value={model.name}>
                      {model.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}

            {/* LoRA Selection */}
            {filteredLoras.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  LoRA (Optional)
                </label>
                <Select
                  placeholder="Select a LoRA"
                  selectedKeys={selectedLora ? [selectedLora] : []}
                  onSelectionChange={(keys) =>
                    setSelectedLora(Array.from(keys)[0] as string)
                  }
                >
                  {filteredLoras.map((lora) => (
                    <SelectItem key={lora.name} value={lora.name}>
                      {lora.name} (Strength: {lora.strength})
                    </SelectItem>
                  ))}
                </Select>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Prompt</label>
              <Textarea
                placeholder="Describe what you want to generate..."
                value={prompt}
                onValueChange={setPrompt}
                minRows={3}
                maxRows={6}
                classNames={{
                  inputWrapper: "bg-background border-neutral-700",
                }}
              />
            </div>

            {/* Generation Controls */}
            <div className="flex gap-2">
              <Button
                color="primary"
                startContent={<BiPlay />}
                onPress={startGeneration}
                isLoading={isGenerating}
                isDisabled={!prompt.trim()}
                className="flex-1"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
              {isGenerating && (
                <Button
                  color="danger"
                  startContent={<BiStop />}
                  onPress={cancelGeneration}
                  variant="bordered"
                >
                  Cancel
                </Button>
              )}
            </div>

            {/* Generation Status */}
            {generationStatus && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Chip
                    color={getStatusColor(generationStatus.status)}
                    size="sm"
                  >
                    {generationStatus.status}
                  </Chip>
                </div>
                {generationStatus.status === "processing" && (
                  <Progress
                    size="sm"
                    isIndeterminate
                    color="primary"
                    className="w-full"
                  />
                )}
                {generationStatus.error && (
                  <div className="text-danger text-sm">
                    {generationStatus.error}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Generated Content */}
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-lg font-semibold">Generated Content</h2>
          </CardHeader>
          <CardBody>
            {generatedContent ? (
              <div className="space-y-4">
                {generatedContent.type === "image" && (
                  <div className="space-y-2">
                    <img
                      src={generatedContent.url}
                      alt="Generated"
                      className="w-full rounded-lg border border-neutral-700"
                    />
                    <div className="text-sm text-neutral-400">
                      Model: {generatedContent.model_used}
                    </div>
                  </div>
                )}

                {generatedContent.type === "audio" && (
                  <div className="space-y-2">
                    <audio controls className="w-full">
                      <source src={generatedContent.url} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="text-sm text-neutral-400">
                      Model: {generatedContent.model_used}
                    </div>
                  </div>
                )}

                {generatedContent.type === "video" && (
                  <div className="space-y-2">
                    <video controls className="w-full rounded-lg">
                      <source src={generatedContent.url} type="video/mp4" />
                      Your browser does not support the video element.
                    </video>
                    <div className="text-sm text-neutral-400">
                      Model: {generatedContent.model_used}
                    </div>
                  </div>
                )}

                {generatedContent.type === "text" && (
                  <div className="space-y-2">
                    <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-700">
                      <p className="text-sm">{generatedContent.content}</p>
                    </div>
                    <div className="text-sm text-neutral-400">
                      Model: {generatedContent.model_used}
                    </div>
                  </div>
                )}

                <Button
                  color="primary"
                  variant="bordered"
                  startContent={<BiDownload />}
                  className="w-full"
                >
                  Download
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-neutral-500">
                <div className="text-center">
                  <BiImage size={48} className="mx-auto mb-2" />
                  <p>No content generated yet</p>
                  <p className="text-sm">
                    Enter a prompt and click Generate to create content
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
