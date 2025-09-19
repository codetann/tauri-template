import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Slider,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { invoke } from "@tauri-apps/api/core";
import { ChatOptions } from "@/state/conversationStore";

interface ModelInfo {
  name: string;
  model_type: string;
  description: string;
  parameters: any;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateChat: (options: ChatOptions, title?: string) => Promise<void>;
}

const DEFAULT_PARAMETERS = {
  temperature: 0.7,
  maxTokens: 2048,
  topP: 0.9,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export default function NewChatModal({
  isOpen,
  onClose,
  onCreateChat,
}: NewChatModalProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [chatTitle, setChatTitle] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    try {
      const result = await invoke<ModelInfo[]>("get_available_models");
      const textModels = result.filter(
        (model) => model.model_type === "text-generation"
      );
      setModels(textModels);

      if (textModels.length > 0 && !selectedModel) {
        setSelectedModel(textModels[0].name);
      }
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  };

  const handleCreateChat = async () => {
    if (!selectedModel) return;

    setIsLoading(true);
    try {
      const options: ChatOptions = {
        model: selectedModel,
        modelParameters: parameters,
        systemPrompt: systemPrompt.trim() || undefined,
      };

      await onCreateChat(options, chatTitle.trim() || undefined);

      // Reset form
      setChatTitle("");
      setSystemPrompt("");
      setParameters(DEFAULT_PARAMETERS);
      setSelectedModel(models.length > 0 ? models[0].name : "");

      onClose();
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModelInfo = models.find(
    (model) => model.name === selectedModel
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Create New Chat</h2>
          <p className="text-sm text-neutral-400">
            Configure your new conversation with AI
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* Basic Settings */}
            <Card>
              <CardBody className="space-y-4">
                <h3 className="font-medium">Basic Settings</h3>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Chat Title
                  </label>
                  <Input
                    placeholder="Enter a title for your chat (optional)"
                    value={chatTitle}
                    onValueChange={setChatTitle}
                    classNames={{
                      inputWrapper: "bg-background border-neutral-700",
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Model
                  </label>
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

                {selectedModelInfo && (
                  <div className="p-3 bg-neutral-900 rounded-lg">
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

            {/* System Prompt */}
            <Card>
              <CardBody>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    System Prompt
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    Define the AI's behavior and personality (optional)
                  </p>
                  <Textarea
                    placeholder="You are a helpful AI assistant..."
                    value={systemPrompt}
                    onValueChange={setSystemPrompt}
                    minRows={3}
                    maxRows={6}
                    classNames={{
                      inputWrapper: "bg-background border-neutral-700",
                    }}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Advanced Parameters */}
            <Card>
              <CardBody className="space-y-4">
                <h3 className="font-medium">Advanced Parameters</h3>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Temperature: {parameters.temperature}
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    Controls randomness. Lower values make responses more
                    focused and deterministic.
                  </p>
                  <Slider
                    value={parameters.temperature}
                    onChange={(value) =>
                      setParameters((prev) => ({
                        ...prev,
                        temperature: value as number,
                      }))
                    }
                    minValue={0}
                    maxValue={2}
                    step={0.1}
                    className="w-full"
                    color="primary"
                    size="sm"
                  />
                </div>

                <Divider />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Tokens: {parameters.maxTokens}
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    Maximum number of tokens in the response.
                  </p>
                  <Slider
                    value={parameters.maxTokens}
                    onChange={(value) =>
                      setParameters((prev) => ({
                        ...prev,
                        maxTokens: value as number,
                      }))
                    }
                    minValue={100}
                    maxValue={4096}
                    step={100}
                    className="w-full"
                    color="primary"
                    size="sm"
                  />
                </div>

                <Divider />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Top P: {parameters.topP}
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    Controls diversity via nucleus sampling. Lower values focus
                    on more likely tokens.
                  </p>
                  <Slider
                    value={parameters.topP}
                    onChange={(value) =>
                      setParameters((prev) => ({
                        ...prev,
                        topP: value as number,
                      }))
                    }
                    minValue={0}
                    maxValue={1}
                    step={0.1}
                    className="w-full"
                    color="primary"
                    size="sm"
                  />
                </div>

                <Divider />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Frequency Penalty: {parameters.frequencyPenalty}
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    Reduces likelihood of repeating the same line verbatim.
                  </p>
                  <Slider
                    value={parameters.frequencyPenalty}
                    onChange={(value) =>
                      setParameters((prev) => ({
                        ...prev,
                        frequencyPenalty: value as number,
                      }))
                    }
                    minValue={-2}
                    maxValue={2}
                    step={0.1}
                    className="w-full"
                    color="primary"
                    size="sm"
                  />
                </div>

                <Divider />

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Presence Penalty: {parameters.presencePenalty}
                  </label>
                  <p className="text-xs text-neutral-400 mb-2">
                    Increases likelihood of talking about new topics.
                  </p>
                  <Slider
                    value={parameters.presencePenalty}
                    onChange={(value) =>
                      setParameters((prev) => ({
                        ...prev,
                        presencePenalty: value as number,
                      }))
                    }
                    minValue={-2}
                    maxValue={2}
                    step={0.1}
                    className="w-full"
                    color="primary"
                    size="sm"
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button
            color="danger"
            variant="light"
            onPress={onClose}
            isDisabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleCreateChat}
            isLoading={isLoading}
            isDisabled={!selectedModel}
          >
            Create Chat
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
