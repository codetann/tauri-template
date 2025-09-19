import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BiSend,
  BiCog,
  BiX,
  BiImage,
  BiPalette,
  BiSlider,
} from "react-icons/bi";
import { Button, Input, Slider, Select, SelectItem } from "@heroui/react";

interface FloatingPromptInputProps {
  prompt: string;
  onPromptSubmit: (prompt: string) => void;
  showInpaintSettings: boolean;
  onToggleInpaintSettings: () => void;
}

export function FloatingPromptInput({
  prompt,
  onPromptSubmit,
  showInpaintSettings,
  onToggleInpaintSettings,
}: FloatingPromptInputProps) {
  const [inputPrompt, setInputPrompt] = useState(prompt);
  const [strength, setStrength] = useState(0.8);
  const [guidance, setGuidance] = useState(7.5);
  const [steps, setSteps] = useState(20);
  const [model, setModel] = useState("stable-diffusion");

  const handleSubmit = () => {
    if (inputPrompt.trim()) {
      onPromptSubmit(inputPrompt.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const models = [
    { key: "stable-diffusion", label: "Stable Diffusion" },
    { key: "dalle-3", label: "DALL-E 3" },
    { key: "midjourney", label: "Midjourney" },
    { key: "kandinsky", label: "Kandinsky" },
  ];

  return (
    <>
      {/* Main Floating Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
      >
        <div className="bg-white border border-default-200 rounded-2xl shadow-lg p-4 min-w-96 max-w-2xl">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what you want to inpaint..."
                className="w-full"
                startContent={<BiImage className="text-default-400" />}
                endContent={
                  <div className="flex items-center gap-2">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={onToggleInpaintSettings}
                      className={
                        showInpaintSettings
                          ? "text-primary"
                          : "text-default-400"
                      }
                    >
                      <BiCog className="text-lg" />
                    </Button>
                    <Button
                      isIconOnly
                      color="primary"
                      size="sm"
                      onClick={handleSubmit}
                      isDisabled={!inputPrompt.trim()}
                    >
                      <BiSend className="text-lg" />
                    </Button>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Inpaint Settings Panel */}
      <AnimatePresence>
        {showInpaintSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-40"
          >
            <div className="bg-white border border-default-200 rounded-2xl shadow-lg p-6 min-w-96 max-w-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-default-900 flex items-center gap-2">
                  <BiSlider className="text-primary" />
                  Inpaint Settings
                </h3>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={onToggleInpaintSettings}
                >
                  <BiX className="text-lg" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Model Selection */}
                <div>
                  <label className="text-sm font-medium text-default-700 mb-2 block">
                    Model
                  </label>
                  <Select
                    selectedKeys={[model]}
                    onSelectionChange={(keys) =>
                      setModel(Array.from(keys)[0] as string)
                    }
                    placeholder="Select a model"
                    className="w-full"
                  >
                    {models.map((modelOption) => (
                      <SelectItem key={modelOption.key} value={modelOption.key}>
                        {modelOption.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Strength */}
                <div>
                  <label className="text-sm font-medium text-default-700 mb-2 block">
                    Inpaint Strength: {strength}
                  </label>
                  <Slider
                    value={strength}
                    onChange={(value) =>
                      setStrength(Array.isArray(value) ? value[0] : value)
                    }
                    minValue={0.1}
                    maxValue={1.0}
                    step={0.1}
                    className="w-full"
                    color="primary"
                  />
                  <p className="text-xs text-default-500 mt-1">
                    How much the original image should be preserved
                  </p>
                </div>

                {/* Guidance Scale */}
                <div>
                  <label className="text-sm font-medium text-default-700 mb-2 block">
                    Guidance Scale: {guidance}
                  </label>
                  <Slider
                    value={guidance}
                    onChange={(value) =>
                      setGuidance(Array.isArray(value) ? value[0] : value)
                    }
                    minValue={1.0}
                    maxValue={20.0}
                    step={0.5}
                    className="w-full"
                    color="primary"
                  />
                  <p className="text-xs text-default-500 mt-1">
                    How closely to follow the prompt
                  </p>
                </div>

                {/* Steps */}
                <div>
                  <label className="text-sm font-medium text-default-700 mb-2 block">
                    Steps: {steps}
                  </label>
                  <Slider
                    value={steps}
                    onChange={(value) =>
                      setSteps(Array.isArray(value) ? value[0] : value)
                    }
                    minValue={10}
                    maxValue={50}
                    step={1}
                    className="w-full"
                    color="primary"
                  />
                  <p className="text-xs text-default-500 mt-1">
                    Number of denoising steps (higher = better quality, slower)
                  </p>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-sm font-medium text-default-700 mb-2 block">
                    Quick Presets
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() => {
                        setStrength(0.5);
                        setGuidance(7.5);
                        setSteps(20);
                      }}
                    >
                      Balanced
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() => {
                        setStrength(0.8);
                        setGuidance(10);
                        setSteps(30);
                      }}
                    >
                      High Quality
                    </Button>
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() => {
                        setStrength(0.3);
                        setGuidance(5);
                        setSteps(15);
                      }}
                    >
                      Fast
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
