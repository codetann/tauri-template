import React, { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Textarea,
} from "@heroui/react";
import { BiSend, BiWrench, BiImage, BiImageAdd, BiBrush } from "react-icons/bi";
import { useImageStore, ImageGenerationRequest } from "@/state/imageStore";

interface FloatingInputProps {
  onOpenAdvancedSettings: () => void;
}

const GENERATION_TYPES = [
  { key: "text-to-image", label: "Text to Image", icon: BiImage },
  { key: "image-to-image", label: "Image to Image", icon: BiImageAdd },
  { key: "inpainting", label: "Inpainting", icon: BiBrush },
];

export default function FloatingInput({
  onOpenAdvancedSettings,
}: FloatingInputProps) {
  const {
    models,
    loras,
    selectedModel,
    selectedLora,
    setSelectedModel,
    setSelectedLora,
    generateImage,
    isLoading,
  } = useImageStore();

  const [prompt, setPrompt] = useState("");
  const [generationType, setGenerationType] = useState("text-to-image");

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;

    try {
      const request: ImageGenerationRequest = {
        prompt: prompt.trim(),
        model: selectedModel,
        lora: selectedLora || undefined,
        parameters: {
          width: 512,
          height: 512,
          steps: 20,
          guidanceScale: 7.5,
          batchSize: 1,
          scheduler: "DDIM",
          numInferenceSteps: 20,
        },
      };

      await generateImage(request);
      setPrompt(""); // Clear prompt after successful generation
    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const selectedModelInfo = models.find(
    (model) => model.name === selectedModel
  );
  const selectedLoraInfo = loras.find((lora) => lora.name === selectedLora);

  return (
    <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 gap-4 z-50 shadow-2xl border-neutral-700 w-[60rem]">
      <CardBody className="p-4">
        <div className="flex items-center gap-3">
          {/* Generation Type Selector */}
          <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
            {GENERATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.key}
                  size="sm"
                  variant={generationType === type.key ? "solid" : "light"}
                  color={generationType === type.key ? "primary" : "default"}
                  className="min-w-0 px-2"
                  onPress={() => setGenerationType(type.key)}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline ml-1 text-xs">
                    {type.label}
                  </span>
                </Button>
              );
            })}
          </div>

          {/* Model Selection */}
          <Select
            placeholder="Model"
            selectedKeys={selectedModel ? [selectedModel] : []}
            onSelectionChange={(keys) =>
              setSelectedModel(Array.from(keys)[0] as string)
            }
            className="w-40"
            size="sm"
            classNames={{
              trigger: "bg-background border-neutral-700",
            }}
          >
            {models.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-neutral-400">
                    {model.description}
                  </span>
                </div>
              </SelectItem>
            ))}
          </Select>

          {/* LoRA Selection */}
          {selectedModel && (
            <Select
              placeholder="LoRA"
              selectedKeys={selectedLora ? [selectedLora] : []}
              onSelectionChange={(keys) =>
                setSelectedLora(Array.from(keys)[0] as string)
              }
              className="w-32"
              size="sm"
              classNames={{
                trigger: "bg-background border-neutral-700",
              }}
            >
              <SelectItem key="" value="">
                None
              </SelectItem>
              {loras.map((lora) => (
                <SelectItem key={lora.name} value={lora.name}>
                  <div className="flex flex-col">
                    <span className="font-medium">{lora.name}</span>
                    <span className="text-xs text-neutral-400">
                      Strength: {lora.strength}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </Select>
          )}

          {/* Prompt Input */}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="bordered"
              onPress={onOpenAdvancedSettings}
              isDisabled={isLoading}
            >
              <BiWrench size={16} />
              <span className="hidden sm:inline ml-1">Advanced</span>
            </Button>

            <Button
              color="primary"
              onPress={handleGenerate}
              isLoading={isLoading}
              isDisabled={!prompt.trim() || !selectedModel}
              size="sm"
            >
              <BiSend size={16} />
              <span className="hidden sm:inline ml-1">Generate</span>
            </Button>
          </div>
        </div>

        <Textarea
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onValueChange={setPrompt}
          onKeyDown={handleKeyDown}
          className="flex-1  "
          isDisabled={isLoading}
          size="lg"
          classNames={{
            inputWrapper: "bg-background border-neutral-700 h-96 mt-4",
          }}
        />

        {/* Quick Info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            {selectedModelInfo && (
              <Chip size="sm" variant="flat" color="primary">
                {selectedModelInfo.name}
              </Chip>
            )}
            {selectedLoraInfo && (
              <Chip size="sm" variant="flat" color="secondary">
                {selectedLoraInfo.name}
              </Chip>
            )}
            <Chip size="sm" variant="flat" color="default">
              {generationType.replace("-", " ")}
            </Chip>
          </div>

          <p className="text-xs text-neutral-400">
            Press Enter to generate, Shift+Enter for new line
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
