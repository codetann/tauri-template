import { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  Progress,
  Input,
} from "@heroui/react";
import {
  BiPlay,
  BiPause,
  BiDownload,
  BiTrash,
  BiRefresh,
  BiCopy,
  BiMusic,
  BiVolumeFull,
  BiSearch,
  BiTime,
} from "react-icons/bi";
import { useAudioStore, GeneratedAudio } from "@/state/audioStore";

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  const sizes = ["Bytes", "KB", "MB", "GB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
};

export default function AudioList() {
  const { audios, deleteAudio, retryGeneration, checkGenerationStatus } =
    useAudioStore();

  const [selectedAudio, setSelectedAudio] = useState<GeneratedAudio | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Filter audios based on search query
  const filteredAudios = audios.filter(
    (audio) =>
      audio.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audio.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check status for generating audios
  useEffect(() => {
    const generatingAudios = audios.filter(
      (audio) => audio.status === "generating"
    );

    if (generatingAudios.length > 0) {
      const interval = setInterval(() => {
        generatingAudios.forEach((audio) => {
          checkGenerationStatus(audio.id);
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [audios, checkGenerationStatus]);

  const handleAudioClick = (audio: GeneratedAudio) => {
    if (audio.status === "completed") {
      setSelectedAudio(audio);
      setIsModalOpen(true);
    }
  };

  const handleCopyPrompt = async (prompt: string, audioId: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPromptId(audioId);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
  };

  const handleDownloadAudio = (url: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `generated_${prompt
      .substring(0, 30)
      .replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePlayPause = (audioId: string, audioUrl: string) => {
    if (playingAudioId === audioId) {
      // Pause current audio
      setPlayingAudioId(null);
      // Stop all audio elements
      document.querySelectorAll("audio").forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    } else {
      // Stop any currently playing audio
      document.querySelectorAll("audio").forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });

      // Play new audio
      setPlayingAudioId(audioId);
      const audio = new Audio(audioUrl);
      audio.play();

      audio.onended = () => setPlayingAudioId(null);
    }
  };

  const handleRetryGeneration = async (
    audioId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    await retryGeneration(audioId);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-6">
        <Input
          placeholder="Search audios..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<BiSearch />}
          className="max-w-md"
          classNames={{
            inputWrapper: "bg-background border-neutral-700",
          }}
        />
      </div>

      {/* Audio List */}
      {filteredAudios.length === 0 ? (
        <Card className="p-8 text-center">
          <CardBody>
            <BiMusic size={64} className="mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? "No audios found" : "No audios generated yet"}
            </h3>
            <p className="text-sm text-neutral-400">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start generating audio content using the floating input below"}
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAudios.map((audio) => (
            <Card
              key={audio.id}
              className="cursor-pointer hover:bg-neutral-800/50 transition-colors"
              onPress={() =>
                audio.status === "completed" && handleAudioClick(audio)
              }
            >
              <CardBody className="p-4">
                <div className="flex items-center gap-4">
                  {/* Play Button / Status */}
                  <div className="flex-shrink-0">
                    {audio.status === "completed" && audio.audioUrl ? (
                      <Button
                        isIconOnly
                        variant="flat"
                        size="lg"
                        color="primary"
                        onPress={() =>
                          handlePlayPause(audio.id, audio.audioUrl!)
                        }
                      >
                        {playingAudioId === audio.id ? (
                          <BiPause size={20} />
                        ) : (
                          <BiPlay size={20} />
                        )}
                      </Button>
                    ) : audio.status === "generating" ? (
                      <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center">
                        <Progress
                          size="sm"
                          value={75}
                          className="w-8 h-8"
                          classNames={{
                            track: "drop-shadow-md border border-default",
                            indicator:
                              "bg-gradient-to-r from-blue-500 to-purple-500",
                            label:
                              "tracking-wider font-medium text-default-foreground",
                            value: "text-foreground/60",
                          }}
                        />
                      </div>
                    ) : audio.status === "failed" ? (
                      <Button
                        isIconOnly
                        variant="flat"
                        size="lg"
                        color="danger"
                        onPress={(e) => handleRetryGeneration(audio.id, e)}
                      >
                        <BiRefresh size={20} />
                      </Button>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-neutral-700 flex items-center justify-center">
                        <BiMusic size={24} className="text-neutral-400" />
                      </div>
                    )}
                  </div>

                  {/* Audio Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{audio.prompt}</h4>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          audio.generationType === "text-to-audio"
                            ? "primary"
                            : "secondary"
                        }
                      >
                        {audio.generationType === "text-to-audio"
                          ? "Music"
                          : "Speech"}
                      </Chip>
                      {audio.status === "generating" && (
                        <Chip size="sm" variant="flat" color="warning">
                          Generating...
                        </Chip>
                      )}
                      {audio.status === "failed" && (
                        <Chip size="sm" variant="flat" color="danger">
                          Failed
                        </Chip>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-neutral-400">
                      <span className="flex items-center gap-1">
                        <BiVolumeFull size={14} />
                        {audio.model}
                      </span>
                      {audio.metadata?.duration && (
                        <span className="flex items-center gap-1">
                          <BiTime size={14} />
                          {formatDuration(audio.metadata.duration)}
                        </span>
                      )}
                      {audio.metadata?.fileSize && (
                        <span>{formatFileSize(audio.metadata.fileSize)}</span>
                      )}
                      <span>{formatDate(audio.createdAt)}</span>
                    </div>

                    {/* Generation Progress */}
                    {audio.status === "generating" && (
                      <div className="mt-2">
                        <Progress
                          size="sm"
                          value={75}
                          className="max-w-xs"
                          classNames={{
                            track: "drop-shadow-md border border-default",
                            indicator:
                              "bg-gradient-to-r from-blue-500 to-purple-500",
                          }}
                        />
                      </div>
                    )}

                    {/* Error Message */}
                    {audio.status === "failed" && audio.error && (
                      <div className="mt-2">
                        <p className="text-sm text-red-400">{audio.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {audio.status === "completed" && (
                      <>
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          onPress={() =>
                            handleCopyPrompt(audio.prompt, audio.id)
                          }
                        >
                          <BiCopy size={16} />
                        </Button>
                        {audio.audioUrl && (
                          <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            onPress={() =>
                              handleDownloadAudio(audio.audioUrl!, audio.prompt)
                            }
                          >
                            <BiDownload size={16} />
                          </Button>
                        )}
                      </>
                    )}

                    {audio.status === "failed" && (
                      <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        color="warning"
                        onPress={(e) => handleRetryGeneration(audio.id, e)}
                      >
                        <BiRefresh size={16} />
                      </Button>
                    )}

                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      color="danger"
                      onPress={(e) => {
                        e.stopPropagation();
                        deleteAudio(audio.id);
                      }}
                    >
                      <BiTrash size={16} />
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Audio Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="2xl"
        classNames={{
          base: "bg-neutral-900",
          header: "border-b border-neutral-700",
          body: "py-6",
          footer: "border-t border-neutral-700",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <div className="flex items-center justify-between w-full">
              <div>
                <h2 className="text-xl font-semibold">Audio Details</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  {selectedAudio?.prompt}
                </p>
              </div>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsModalOpen(false)}
              >
                ×
              </Button>
            </div>
          </ModalHeader>

          <ModalBody>
            {selectedAudio && (
              <div className="space-y-6">
                {/* Audio Player */}
                {selectedAudio.audioUrl && (
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                      <Button
                        isIconOnly
                        size="lg"
                        color="primary"
                        onPress={() =>
                          handlePlayPause(
                            selectedAudio.id,
                            selectedAudio.audioUrl!
                          )
                        }
                      >
                        {playingAudioId === selectedAudio.id ? (
                          <BiPause size={24} />
                        ) : (
                          <BiPlay size={24} />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">Generated Audio</h3>
                        {selectedAudio.metadata?.duration && (
                          <p className="text-sm text-neutral-400">
                            Duration:{" "}
                            {formatDuration(selectedAudio.metadata.duration)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Waveform Visualization (placeholder) */}
                    <div className="bg-neutral-700 rounded h-16 flex items-center justify-center">
                      <BiMusic size={32} className="text-neutral-400" />
                    </div>
                  </div>
                )}

                {/* Audio Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">
                      Generation Type
                    </h4>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={
                        selectedAudio.generationType === "text-to-audio"
                          ? "primary"
                          : "secondary"
                      }
                    >
                      {selectedAudio.generationType === "text-to-audio"
                        ? "Music Generation"
                        : "Text-to-Speech"}
                    </Chip>
                  </div>

                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Model</h4>
                    <p className="text-sm">{selectedAudio.model}</p>
                  </div>

                  {selectedAudio.metadata?.fileSize && (
                    <div className="bg-neutral-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">File Size</h4>
                      <p className="text-sm">
                        {formatFileSize(selectedAudio.metadata.fileSize)}
                      </p>
                    </div>
                  )}

                  {selectedAudio.metadata?.format && (
                    <div className="bg-neutral-800 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">Format</h4>
                      <p className="text-sm">
                        {selectedAudio.metadata.format.toUpperCase()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Parameters */}
                {Object.keys(selectedAudio.parameters).length > 0 && (
                  <div className="bg-neutral-800 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3">
                      Generation Parameters
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {Object.entries(selectedAudio.parameters).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-neutral-400 capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}:
                            </span>
                            <span>{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="text-sm text-neutral-400">
                  <p>Generated {formatDate(selectedAudio.createdAt)}</p>
                  {selectedAudio.completedAt && (
                    <p>Completed {formatDate(selectedAudio.completedAt)}</p>
                  )}
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              Close
            </Button>
            {selectedAudio?.audioUrl && (
              <Button
                color="primary"
                startContent={<BiDownload />}
                onPress={() =>
                  handleDownloadAudio(
                    selectedAudio.audioUrl!,
                    selectedAudio.prompt
                  )
                }
              >
                Download
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
