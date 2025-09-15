import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Select,
  SelectItem,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import {
  BiTrash,
  BiDownload,
  BiRefresh,
  BiFilter,
  BiImage,
  BiMusic,
  BiVideo,
  BiText,
} from "react-icons/bi";
import { useAIStore, GenerationHistory } from "@/state/aiStore";

const MODEL_TYPE_ICONS = {
  "text-to-image": BiImage,
  "text-to-audio": BiMusic,
  "text-to-video": BiVideo,
  "text-generation": BiText,
};

const STATUS_COLORS = {
  pending: "warning",
  processing: "primary",
  completed: "success",
  failed: "danger",
  cancelled: "default",
} as const;

export default function GenerationHistoryComponent() {
  const {
    generationHistory,
    removeFromHistory,
    clearHistory,
    checkGenerationStatus,
  } = useAIStore();
  const [filteredHistory, setFilteredHistory] = useState<GenerationHistory[]>(
    []
  );
  const [filterModelType, setFilterModelType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGeneration, setSelectedGeneration] =
    useState<GenerationHistory | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    filterHistory();
  }, [generationHistory, filterModelType, filterStatus, searchQuery]);

  const filterHistory = () => {
    let filtered = [...generationHistory];

    // Filter by model type
    if (filterModelType !== "all") {
      filtered = filtered.filter((gen) => gen.modelType === filterModelType);
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((gen) => gen.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (gen) =>
          gen.prompt.toLowerCase().includes(query) ||
          gen.modelName?.toLowerCase().includes(query) ||
          gen.loraName?.toLowerCase().includes(query)
      );
    }

    setFilteredHistory(filtered);
  };

  const handleRefresh = async (generationId: string) => {
    await checkGenerationStatus(generationId);
  };

  const handleDelete = (generationId: string) => {
    removeFromHistory(generationId);
  };

  const handleViewDetails = (generation: GenerationHistory) => {
    setSelectedGeneration(generation);
    onOpen();
  };

  const handleDownload = (generation: GenerationHistory) => {
    if (generation.result?.url) {
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = generation.result.url;
      link.download = `generation_${generation.id}.${getFileExtension(
        generation.result.type
      )}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileExtension = (type: string) => {
    switch (type) {
      case "image":
        return "png";
      case "audio":
        return "wav";
      case "video":
        return "mp4";
      case "text":
        return "txt";
      default:
        return "bin";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const truncatePrompt = (prompt: string, maxLength: number = 50) => {
    return prompt.length > maxLength
      ? `${prompt.substring(0, maxLength)}...`
      : prompt;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <BiFilter size={20} />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select
              placeholder="Model Type"
              selectedKeys={filterModelType !== "all" ? [filterModelType] : []}
              onSelectionChange={(keys) =>
                setFilterModelType((Array.from(keys)[0] as string) || "all")
              }
              className="w-40"
            >
              <SelectItem key="all">All Types</SelectItem>
              <SelectItem key="text-to-image">Text to Image</SelectItem>
              <SelectItem key="text-to-audio">Text to Audio</SelectItem>
              <SelectItem key="text-to-video">Text to Video</SelectItem>
              <SelectItem key="text-generation">Text Generation</SelectItem>
            </Select>

            <Select
              placeholder="Status"
              selectedKeys={filterStatus !== "all" ? [filterStatus] : []}
              onSelectionChange={(keys) =>
                setFilterStatus((Array.from(keys)[0] as string) || "all")
              }
              className="w-32"
            >
              <SelectItem key="all">All Status</SelectItem>
              <SelectItem key="pending">Pending</SelectItem>
              <SelectItem key="processing">Processing</SelectItem>
              <SelectItem key="completed">Completed</SelectItem>
              <SelectItem key="failed">Failed</SelectItem>
              <SelectItem key="cancelled">Cancelled</SelectItem>
            </Select>

            <Input
              placeholder="Search prompts, models, LoRAs..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="w-64"
              size="sm"
            />

            <Button
              color="danger"
              variant="bordered"
              size="sm"
              onPress={clearHistory}
              isDisabled={generationHistory.length === 0}
            >
              Clear All
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* History List */}
      <div className="space-y-2">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-8 text-neutral-500">
                <p>No generations found</p>
                <p className="text-sm">
                  Try adjusting your filters or start a new generation
                </p>
              </div>
            </CardBody>
          </Card>
        ) : (
          filteredHistory.map((generation) => {
            const Icon =
              MODEL_TYPE_ICONS[
                generation.modelType as keyof typeof MODEL_TYPE_ICONS
              ] || BiText;

            return (
              <Card
                key={generation.id}
                className="hover:bg-neutral-900/50 transition-colors"
              >
                <CardBody>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Icon size={24} className="text-primary" />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium truncate">
                            {truncatePrompt(generation.prompt)}
                          </span>
                          <Chip
                            color={
                              STATUS_COLORS[
                                generation.status as keyof typeof STATUS_COLORS
                              ] || "default"
                            }
                            size="sm"
                            variant="flat"
                          >
                            {generation.status}
                          </Chip>
                        </div>

                        <div className="text-sm text-neutral-400 space-x-4">
                          <span>
                            Model: {generation.modelName || "Default"}
                          </span>
                          {generation.loraName && (
                            <span>LoRA: {generation.loraName}</span>
                          )}
                          <span>{formatDate(generation.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleRefresh(generation.id)}
                        isDisabled={generation.status === "completed"}
                      >
                        <BiRefresh size={16} />
                      </Button>

                      {generation.result && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() => handleDownload(generation)}
                        >
                          <BiDownload size={16} />
                        </Button>
                      )}

                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        onPress={() => handleViewDetails(generation)}
                      >
                        View
                      </Button>

                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleDelete(generation.id)}
                      >
                        <BiTrash size={16} />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })
        )}
      </div>

      {/* Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>Generation Details</ModalHeader>
          <ModalBody>
            {selectedGeneration && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Prompt</h3>
                  <p className="text-sm bg-neutral-900 p-3 rounded-lg">
                    {selectedGeneration.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Model Type</h3>
                    <p className="text-sm">{selectedGeneration.modelType}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Model</h3>
                    <p className="text-sm">
                      {selectedGeneration.modelName || "Default"}
                    </p>
                  </div>
                  {selectedGeneration.loraName && (
                    <div>
                      <h3 className="font-medium mb-2">LoRA</h3>
                      <p className="text-sm">{selectedGeneration.loraName}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium mb-2">Status</h3>
                    <Chip
                      color={
                        STATUS_COLORS[
                          selectedGeneration.status as keyof typeof STATUS_COLORS
                        ] || "default"
                      }
                      size="sm"
                    >
                      {selectedGeneration.status}
                    </Chip>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Parameters</h3>
                  <pre className="text-sm bg-neutral-900 p-3 rounded-lg overflow-auto">
                    {JSON.stringify(selectedGeneration.parameters, null, 2)}
                  </pre>
                </div>

                {selectedGeneration.result && (
                  <div>
                    <h3 className="font-medium mb-2">Result</h3>
                    <pre className="text-sm bg-neutral-900 p-3 rounded-lg overflow-auto">
                      {JSON.stringify(selectedGeneration.result, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Created</h3>
                    <p className="text-sm">
                      {formatDate(selectedGeneration.createdAt)}
                    </p>
                  </div>
                  {selectedGeneration.completedAt && (
                    <div>
                      <h3 className="font-medium mb-2">Completed</h3>
                      <p className="text-sm">
                        {formatDate(selectedGeneration.completedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
