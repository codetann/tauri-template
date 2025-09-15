import { useState } from "react";
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
import { BiSend, BiMusic, BiVolumeFull } from "react-icons/bi";
import { useAudioStore, AudioGenerationRequest } from "@/state/audioStore";

interface AudioFloatingInputProps {
  // No advanced settings for now, so no props needed
}

const GENERATION_TYPES = [
  { key: "text-to-audio", label: "Music Generation", icon: BiMusic },
  { key: "text-to-speech", label: "Text-to-Speech", icon: BiVolumeFull },
];

const AUDIO_FORMATS = [
  { key: "mp3", label: "MP3" },
  { key: "wav", label: "WAV" },
  { key: "flac", label: "FLAC" },
  { key: "ogg", label: "OGG" },
];

const VOICE_OPTIONS = [
  { key: "default", label: "Default Voice" },
  { key: "male", label: "Male Voice" },
  { key: "female", label: "Female Voice" },
  { key: "child", label: "Child Voice" },
  { key: "elderly", label: "Elderly Voice" },
];

export default function AudioFloatingInput({}: AudioFloatingInputProps) {
  const { models, selectedModel, setSelectedModel, generateAudio, isLoading } =
    useAudioStore();

  const [prompt, setPrompt] = useState("");
  const [generationType, setGenerationType] = useState<
    "text-to-audio" | "text-to-speech"
  >("text-to-audio");
  const [duration, setDuration] = useState<number>(30);
  const [format, setFormat] = useState<string>("mp3");
  const [voice, setVoice] = useState<string>("default");
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [volume, setVolume] = useState<number>(0.8);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedModel || isLoading) return;

    const request: AudioGenerationRequest = {
      prompt: prompt.trim(),
      model: selectedModel,
      generationType,
      parameters: {
        duration: generationType === "text-to-audio" ? duration : undefined,
        format,
        voice: generationType === "text-to-speech" ? voice : undefined,
        speed: generationType === "text-to-speech" ? speed : undefined,
        pitch: generationType === "text-to-speech" ? pitch : undefined,
        volume,
      },
    };

    try {
      await generateAudio(request);
      setPrompt(""); // Clear prompt after successful generation
    } catch (error) {
      console.error("Failed to generate audio:", error);
    }
  };

  const selectedModelInfo = models.find(
    (model) => model.name === selectedModel
  );

  // Filter models by generation type
  const availableModels = models.filter(
    (model) => model.model_type === generationType
  );

  return (
    <Card className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl border-neutral-700 w-[60rem]">
      <CardBody className="p-4">
        {/* Generation Type Selection */}
        <div className="flex items-center gap-2 mb-4">
          {GENERATION_TYPES.map((type) => {
            const IconComponent = type.icon;
            return (
              <Button
                key={type.key}
                variant={generationType === type.key ? "solid" : "bordered"}
                color={generationType === type.key ? "primary" : "default"}
                size="sm"
                className="justify-start"
                onPress={() =>
                  setGenerationType(
                    type.key as "text-to-audio" | "text-to-speech"
                  )
                }
              >
                <IconComponent size={16} />
                <span className="ml-1">{type.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Main Controls Row */}
        <div className="flex items-center gap-3 mb-4">
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
            isDisabled={isLoading}
          >
            {availableModels.map((model) => (
              <SelectItem key={model.name} value={model.name}>
                {model.name}
              </SelectItem>
            ))}
          </Select>

          {/* Format Selection */}
          <Select
            placeholder="Format"
            selectedKeys={format ? [format] : []}
            onSelectionChange={(keys) =>
              setFormat(Array.from(keys)[0] as string)
            }
            className="w-24"
            size="sm"
            classNames={{
              trigger: "bg-background border-neutral-700",
            }}
            isDisabled={isLoading}
          >
            {AUDIO_FORMATS.map((format) => (
              <SelectItem key={format.key} value={format.key}>
                {format.label}
              </SelectItem>
            ))}
          </Select>

          {/* Duration (for text-to-audio) */}
          {generationType === "text-to-audio" && (
            <Input
              type="number"
              placeholder="Duration (s)"
              value={duration.toString()}
              onValueChange={(value) => setDuration(parseInt(value) || 30)}
              className="w-24"
              size="sm"
              min={5}
              max={300}
              classNames={{
                inputWrapper: "bg-background border-neutral-700",
              }}
              isDisabled={isLoading}
            />
          )}

          {/* Voice Selection (for text-to-speech) */}
          {generationType === "text-to-speech" && (
            <Select
              placeholder="Voice"
              selectedKeys={voice ? [voice] : []}
              onSelectionChange={(keys) =>
                setVoice(Array.from(keys)[0] as string)
              }
              className="w-32"
              size="sm"
              classNames={{
                trigger: "bg-background border-neutral-700",
              }}
              isDisabled={isLoading}
            >
              {VOICE_OPTIONS.map((voice) => (
                <SelectItem key={voice.key} value={voice.key}>
                  {voice.label}
                </SelectItem>
              ))}
            </Select>
          )}

          {/* Generate Button */}
          <Button
            color="primary"
            size="sm"
            onPress={handleGenerate}
            isDisabled={!prompt.trim() || !selectedModel || isLoading}
            isLoading={isLoading}
            startContent={!isLoading && <BiSend size={16} />}
          >
            Generate
          </Button>
        </div>

        {/* Prompt Input */}
        <Textarea
          placeholder={
            generationType === "text-to-audio"
              ? "Describe the music or sound you want to generate..."
              : "Enter the text you want to convert to speech..."
          }
          value={prompt}
          onValueChange={setPrompt}
          onKeyDown={handleKeyDown}
          className="flex-1"
          isDisabled={isLoading}
          size="lg"
          classNames={{
            inputWrapper: "bg-background border-neutral-700 h-32",
          }}
        />

        {/* Advanced Parameters (for text-to-speech) */}
        {generationType === "text-to-speech" && (
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-700">
            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-400">Speed:</label>
              <Input
                type="number"
                value={speed.toString()}
                onValueChange={(value) => setSpeed(parseFloat(value) || 1.0)}
                className="w-20"
                size="sm"
                min={0.5}
                max={2.0}
                step={0.1}
                classNames={{
                  inputWrapper: "bg-background border-neutral-700",
                }}
                isDisabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-400">Pitch:</label>
              <Input
                type="number"
                value={pitch.toString()}
                onValueChange={(value) => setPitch(parseFloat(value) || 1.0)}
                className="w-20"
                size="sm"
                min={0.5}
                max={2.0}
                step={0.1}
                classNames={{
                  inputWrapper: "bg-background border-neutral-700",
                }}
                isDisabled={isLoading}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-neutral-400">Volume:</label>
              <Input
                type="number"
                value={volume.toString()}
                onValueChange={(value) => setVolume(parseFloat(value) || 0.8)}
                className="w-20"
                size="sm"
                min={0.0}
                max={1.0}
                step={0.1}
                classNames={{
                  inputWrapper: "bg-background border-neutral-700",
                }}
                isDisabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Quick Info */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-700">
          <div className="flex items-center gap-2">
            {selectedModelInfo && (
              <Chip size="sm" variant="flat" color="primary">
                {selectedModelInfo.description}
              </Chip>
            )}
            <Chip size="sm" variant="flat" color="secondary">
              {generationType === "text-to-audio" ? "Music" : "Speech"}
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
