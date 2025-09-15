import React, { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Slider,
  Card,
  CardBody,
  Divider,
  Switch,
  Chip,
} from "@heroui/react";
import {
  BiX,
  BiSend,
  BiImage,
  BiImageAdd,
  BiBrush,
  BiUpload,
  BiTrash,
} from "react-icons/bi";
import { useImageStore, ImageGenerationRequest } from "@/state/imageStore";

interface AdvancedSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const GENERATION_TYPES = [
  { key: "text-to-image", label: "Text to Image", icon: BiImage },
  { key: "image-to-image", label: "Image to Image", icon: BiImageAdd },
  { key: "inpainting", label: "Inpainting", icon: BiBrush },
];

const SCHEDULER_OPTIONS = [
  "DDIM",
  "DDPM",
  "DPM++",
  "Euler",
  "EulerAncestral",
  "Heun",
  "LMS",
  "PNDM",
];

const ASPECT_RATIOS = [
  { label: "Square", value: "1:1", width: 512, height: 512 },
  { label: "Portrait", value: "2:3", width: 512, height: 768 },
  { label: "Landscape", value: "3:2", width: 768, height: 512 },
  { label: "Wide", value: "16:9", width: 1024, height: 576 },
  { label: "Ultra Wide", value: "21:9", width: 1024, height: 448 },
  { label: "Custom", value: "custom", width: 512, height: 512 },
];

export default function AdvancedSettingsDrawer({
  isOpen,
  onClose,
}: AdvancedSettingsDrawerProps) {
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
  const [negativePrompt, setNegativePrompt] = useState("");
  const [generationType, setGenerationType] = useState("text-to-image");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [customWidth, setCustomWidth] = useState(512);
  const [customHeight, setCustomHeight] = useState(512);
  const [steps, setSteps] = useState(20);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [scheduler, setScheduler] = useState("DDIM");
  const [seed, setSeed] = useState<number | undefined>();
  const [batchSize, setBatchSize] = useState(1);
  const [strength, setStrength] = useState(0.8); // For img2img
  const [inputImage, setInputImage] = useState<string>("");
  const [inputImageMask, setInputImageMask] = useState<string>("");

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setPrompt("");
      setNegativePrompt("");
      setGenerationType("text-to-image");
      setAspectRatio("1:1");
      setCustomWidth(512);
      setCustomHeight(512);
      setSteps(20);
      setGuidanceScale(7.5);
      setScheduler("DDIM");
      setSeed(undefined);
      setBatchSize(1);
      setStrength(0.8);
      setInputImage("");
      setInputImageMask("");
    }
  }, [isOpen]);

  // Update dimensions when aspect ratio changes
  useEffect(() => {
    const ratio = ASPECT_RATIOS.find((r) => r.value === aspectRatio);
    if (ratio && ratio.value !== "custom") {
      setCustomWidth(ratio.width);
      setCustomHeight(ratio.height);
    }
  }, [aspectRatio]);

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel) return;

    try {
      const request: ImageGenerationRequest = {
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        model: selectedModel,
        lora: selectedLora || undefined,
        parameters: {
          width: customWidth,
          height: customHeight,
          steps,
          guidanceScale,
          seed,
          batchSize,
          scheduler,
          numInferenceSteps: steps,
          strength: generationType === "image-to-image" ? strength : undefined,
        },
        inputImage: inputImage || undefined,
        inputImageMask: inputImageMask || undefined,
      };

      await generateImage(request);
      onClose(); // Close drawer after successful generation
    } catch (error) {
      console.error("Failed to generate image:", error);
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "input" | "mask"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === "input") {
          setInputImage(result);
        } else {
          setInputImageMask(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (type: "input" | "mask") => {
    if (type === "input") {
      setInputImage("");
    } else {
      setInputImageMask("");
    }
  };

  const selectedModelInfo = models.find(
    (model) => model.name === selectedModel
  );
  const selectedLoraInfo = loras.find((lora) => lora.name === selectedLora);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size="lg"
      classNames={{
        base: "bg-neutral-900",
        body: "p-0",
      }}
    >
      <DrawerContent>
        <DrawerHeader className="p-4 border-b border-neutral-700">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold">Advanced Image Generation</h2>
            <Button isIconOnly variant="light" onPress={onClose}>
              <BiX />
            </Button>
          </div>
        </DrawerHeader>

        <DrawerBody className="p-4 space-y-6">
          {/* Generation Type */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-medium">Generation Type</h3>
              <div className="grid grid-cols-1 gap-2">
                {GENERATION_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.key}
                      variant={
                        generationType === type.key ? "solid" : "bordered"
                      }
                      color={
                        generationType === type.key ? "primary" : "default"
                      }
                      className="justify-start"
                      onPress={() => setGenerationType(type.key)}
                    >
                      <Icon size={16} />
                      <span className="ml-2">{type.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* Model and LoRA Selection */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-medium">Model Configuration</h3>

              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <Select
                  placeholder="Select a model"
                  selectedKeys={selectedModel ? [selectedModel] : []}
                  onSelectionChange={(keys) =>
                    setSelectedModel(Array.from(keys)[0] as string)
                  }
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
              </div>

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
              </div>

              {selectedModelInfo && (
                <div className="p-3 bg-neutral-800 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">
                    Model Information
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {selectedModelInfo.description}
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Prompts */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-medium">Prompts</h3>

              <div>
                <label className="text-sm font-medium mb-2 block">Prompt</label>
                <Textarea
                  placeholder="Describe the image you want to generate..."
                  value={prompt}
                  onValueChange={setPrompt}
                  minRows={3}
                  maxRows={6}
                  classNames={{
                    inputWrapper: "bg-background border-neutral-700",
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Negative Prompt
                </label>
                <Textarea
                  placeholder="What you don't want in the image..."
                  value={negativePrompt}
                  onValueChange={setNegativePrompt}
                  minRows={2}
                  maxRows={4}
                  classNames={{
                    inputWrapper: "bg-background border-neutral-700",
                  }}
                />
              </div>
            </CardBody>
          </Card>

          {/* Image Input (for img2img/inpainting) */}
          {(generationType === "image-to-image" ||
            generationType === "inpainting") && (
            <Card>
              <CardBody className="space-y-4">
                <h3 className="font-medium">Input Image</h3>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Source Image
                  </label>
                  {inputImage ? (
                    <div className="relative">
                      <img
                        src={inputImage}
                        alt="Input"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="flat"
                        className="absolute top-2 right-2"
                        onPress={() => removeImage("input")}
                      >
                        <BiTrash size={14} />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center">
                      <BiUpload
                        size={32}
                        className="mx-auto mb-2 text-neutral-400"
                      />
                      <p className="text-sm text-neutral-400 mb-2">
                        Upload source image
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "input")}
                        className="hidden"
                        id="input-image"
                      />
                      <Button
                        size="sm"
                        variant="bordered"
                        onPress={() =>
                          document.getElementById("input-image")?.click()
                        }
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>

                {generationType === "inpainting" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Mask Image
                    </label>
                    {inputImageMask ? (
                      <div className="relative">
                        <img
                          src={inputImageMask}
                          alt="Mask"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          isIconOnly
                          size="sm"
                          color="danger"
                          variant="flat"
                          className="absolute top-2 right-2"
                          onPress={() => removeImage("mask")}
                        >
                          <BiTrash size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center">
                        <BiUpload
                          size={32}
                          className="mx-auto mb-2 text-neutral-400"
                        />
                        <p className="text-sm text-neutral-400 mb-2">
                          Upload mask image
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "mask")}
                          className="hidden"
                          id="mask-image"
                        />
                        <Button
                          size="sm"
                          variant="bordered"
                          onPress={() =>
                            document.getElementById("mask-image")?.click()
                          }
                        >
                          Choose File
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {generationType === "image-to-image" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Strength: {strength}
                    </label>
                    <p className="text-xs text-neutral-400 mb-2">
                      How much to transform the input image (0.0 = no change,
                      1.0 = completely new)
                    </p>
                    <Slider
                      value={strength}
                      onChange={(value) => setStrength(value as number)}
                      minValue={0}
                      maxValue={1}
                      step={0.1}
                      className="w-full"
                      color="primary"
                    />
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Dimensions */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-medium">Dimensions</h3>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Aspect Ratio
                </label>
                <Select
                  placeholder="Select aspect ratio"
                  selectedKeys={aspectRatio ? [aspectRatio] : []}
                  onSelectionChange={(keys) =>
                    setAspectRatio(Array.from(keys)[0] as string)
                  }
                  classNames={{
                    trigger: "bg-background border-neutral-700",
                  }}
                >
                  {ASPECT_RATIOS.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value}>
                      {ratio.label}{" "}
                      {ratio.value !== "custom" &&
                        `(${ratio.width}x${ratio.height})`}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {aspectRatio === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Width
                    </label>
                    <Input
                      type="number"
                      value={customWidth.toString()}
                      onValueChange={(value) =>
                        setCustomWidth(parseInt(value) || 512)
                      }
                      min={64}
                      max={2048}
                      step={64}
                      classNames={{
                        inputWrapper: "bg-background border-neutral-700",
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Height
                    </label>
                    <Input
                      type="number"
                      value={customHeight.toString()}
                      onValueChange={(value) =>
                        setCustomHeight(parseInt(value) || 512)
                      }
                      min={64}
                      max={2048}
                      step={64}
                      classNames={{
                        inputWrapper: "bg-background border-neutral-700",
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="p-3 bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-400">
                  Final size: {customWidth} x {customHeight} pixels
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Generation Parameters */}
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-medium">Generation Parameters</h3>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Steps: {steps}
                </label>
                <p className="text-xs text-neutral-400 mb-2">
                  Number of denoising steps (higher = better quality, slower)
                </p>
                <Slider
                  value={steps}
                  onChange={(value) => setSteps(value as number)}
                  minValue={1}
                  maxValue={100}
                  step={1}
                  className="w-full"
                  color="primary"
                />
              </div>

              <Divider />

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Guidance Scale: {guidanceScale}
                </label>
                <p className="text-xs text-neutral-400 mb-2">
                  How closely to follow the prompt (higher = more adherence)
                </p>
                <Slider
                  value={guidanceScale}
                  onChange={(value) => setGuidanceScale(value as number)}
                  minValue={1}
                  maxValue={20}
                  step={0.5}
                  className="w-full"
                  color="primary"
                />
              </div>

              <Divider />

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Scheduler
                </label>
                <Select
                  placeholder="Select scheduler"
                  selectedKeys={scheduler ? [scheduler] : []}
                  onSelectionChange={(keys) =>
                    setScheduler(Array.from(keys)[0] as string)
                  }
                  classNames={{
                    trigger: "bg-background border-neutral-700",
                  }}
                >
                  {SCHEDULER_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <Divider />

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Batch Size: {batchSize}
                </label>
                <p className="text-xs text-neutral-400 mb-2">
                  Number of images to generate at once
                </p>
                <Slider
                  value={batchSize}
                  onChange={(value) => setBatchSize(value as number)}
                  minValue={1}
                  maxValue={4}
                  step={1}
                  className="w-full"
                  color="primary"
                />
              </div>

              <Divider />

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Seed (Optional)
                </label>
                <Input
                  type="number"
                  placeholder="Random seed for reproducibility"
                  value={seed?.toString() || ""}
                  onValueChange={(value) =>
                    setSeed(value ? parseInt(value) : undefined)
                  }
                  classNames={{
                    inputWrapper: "bg-background border-neutral-700",
                  }}
                />
              </div>
            </CardBody>
          </Card>

          {/* Generate Button */}
          <div className="sticky bottom-0 bg-neutral-900 pt-4">
            <Button
              color="primary"
              size="lg"
              className="w-full"
              onPress={handleGenerate}
              isLoading={isLoading}
              isDisabled={!prompt.trim() || !selectedModel}
              startContent={<BiSend />}
            >
              Generate Image
            </Button>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
