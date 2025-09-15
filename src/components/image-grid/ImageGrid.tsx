import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Image,
  Progress,
} from "@heroui/react";
import {
  BiSearch,
  BiTrash,
  BiDownload,
  BiRefresh,
  BiImage,
  BiX,
  BiCopy,
  BiCheck,
  BiExpand,
} from "react-icons/bi";
import { useImageStore, GeneratedImage } from "@/state/imageStore";

export default function ImageGrid() {
  const {
    images,
    searchQuery,
    setSearchQuery,
    deleteImage,
    retryGeneration,
    getGenerationStatus,
  } = useImageStore();

  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Filter images based on search query
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;

    return images.filter(
      (img) =>
        img.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (img.lora && img.lora.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [images, searchQuery]);

  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  };

  const handleDeleteImage = (imageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImage(imageId);
    }
  };

  const handleRetryGeneration = async (
    imageId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    await retryGeneration(imageId);
  };

  const handleCopyPrompt = async (prompt: string, imageId: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopiedPromptId(imageId);
      setTimeout(() => setCopiedPromptId(null), 2000);
    } catch (error) {
      console.error("Failed to copy prompt:", error);
    }
  };

  const handleDownloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `generated_${prompt
        .substring(0, 30)
        .replace(/[^a-zA-Z0-9]/g, "_")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "generating":
        return "warning";
      case "completed":
        return "success";
      case "failed":
        return "danger";
      default:
        return "default";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <Input
          placeholder="Search images by prompt, model, or LoRA..."
          value={searchQuery}
          onValueChange={setSearchQuery}
          startContent={<BiSearch size={16} />}
          className="flex-1"
          classNames={{
            inputWrapper: "bg-background border-neutral-700",
          }}
        />
        <Chip color="primary" variant="flat">
          {filteredImages.length} images
        </Chip>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredImages.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardBody>
                <div className="text-center py-12 text-neutral-500">
                  <BiImage size={48} className="mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery
                      ? "No images found"
                      : "No images generated yet"}
                  </h3>
                  <p className="text-sm">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Start by generating your first image"}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : (
          filteredImages.map((image) => (
            <Card
              key={image.id}
              className="cursor-pointer hover:scale-105 transition-transform"
              onPress={() =>
                image.status === "completed" && handleImageClick(image)
              }
            >
              <CardBody className="p-2">
                <div className="relative">
                  {/* Image or Placeholder */}
                  {image.status === "completed" && image.imageUrl ? (
                    <Image
                      src={image.imageUrl}
                      alt={image.prompt}
                      className="w-full h-48 object-cover rounded-lg"
                      classNames={{
                        wrapper: "w-full h-48",
                      }}
                    />
                  ) : image.status === "generating" ? (
                    <div className="w-full h-48 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Progress
                          size="sm"
                          isIndeterminate
                          color="primary"
                          className="mb-2"
                        />
                        <p className="text-xs text-neutral-400">
                          Generating...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-neutral-800 rounded-lg flex items-center justify-center">
                      <div className="text-center text-neutral-500">
                        <BiImage size={32} className="mx-auto mb-2" />
                        <p className="text-xs">Failed</p>
                      </div>
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-2 left-2">
                    <Chip
                      size="sm"
                      color={getStatusColor(image.status)}
                      variant="flat"
                    >
                      {image.status}
                    </Chip>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {image.status === "completed" && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        className="bg-black/50 backdrop-blur-sm"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDownloadImage(image.imageUrl, image.prompt);
                        }}
                      >
                        <BiDownload size={14} />
                      </Button>
                    )}

                    {image.status === "failed" && (
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="warning"
                        className="bg-black/50 backdrop-blur-sm"
                        onPress={(e) => handleRetryGeneration(image.id, e)}
                      >
                        <BiRefresh size={14} />
                      </Button>
                    )}

                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      className="bg-black/50 backdrop-blur-sm"
                      onPress={(e) => handleDeleteImage(image.id, e)}
                    >
                      <BiTrash size={14} />
                    </Button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-neutral-400 truncate">
                    {image.prompt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Chip size="sm" variant="flat" color="primary">
                        {image.model}
                      </Chip>
                      {image.lora && (
                        <Chip size="sm" variant="flat" color="secondary">
                          {image.lora}
                        </Chip>
                      )}
                    </div>

                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={(e) => {
                        e.stopPropagation();
                        handleCopyPrompt(image.prompt, image.id);
                      }}
                    >
                      {copiedPromptId === image.id ? (
                        <BiCheck size={12} className="text-success" />
                      ) : (
                        <BiCopy size={12} />
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-neutral-500">
                    {formatDate(image.createdAt)}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>

      {/* Image Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl font-semibold">Generated Image</h2>
              <Button
                isIconOnly
                variant="light"
                onPress={() => setIsModalOpen(false)}
              >
                <BiX />
              </Button>
            </div>
          </ModalHeader>

          <ModalBody>
            {selectedImage && (
              <div className="space-y-4">
                {/* Image */}
                {selectedImage.imageUrl && (
                  <div className="text-center">
                    <Image
                      src={selectedImage.imageUrl}
                      alt={selectedImage.prompt}
                      className="max-w-full max-h-96 object-contain rounded-lg"
                    />
                  </div>
                )}

                {/* Image Details */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium mb-2">Prompt</h3>
                    <p className="text-sm bg-neutral-900 p-3 rounded-lg">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  {selectedImage.negativePrompt && (
                    <div>
                      <h3 className="font-medium mb-2">Negative Prompt</h3>
                      <p className="text-sm bg-neutral-900 p-3 rounded-lg">
                        {selectedImage.negativePrompt}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Model</h3>
                      <Chip color="primary" variant="flat">
                        {selectedImage.model}
                      </Chip>
                    </div>

                    {selectedImage.lora && (
                      <div>
                        <h3 className="font-medium mb-2">LoRA</h3>
                        <Chip color="secondary" variant="flat">
                          {selectedImage.lora}
                        </Chip>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Parameters</h3>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-neutral-900 p-2 rounded">
                        <span className="text-neutral-400">Size:</span>
                        <br />
                        {selectedImage.parameters.width}x
                        {selectedImage.parameters.height}
                      </div>
                      <div className="bg-neutral-900 p-2 rounded">
                        <span className="text-neutral-400">Steps:</span>
                        <br />
                        {selectedImage.parameters.steps}
                      </div>
                      <div className="bg-neutral-900 p-2 rounded">
                        <span className="text-neutral-400">Guidance:</span>
                        <br />
                        {selectedImage.parameters.guidanceScale}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-neutral-400">
                      Generated {formatDate(selectedImage.createdAt)}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="bordered"
                        startContent={<BiCopy />}
                        onPress={() =>
                          handleCopyPrompt(
                            selectedImage.prompt,
                            selectedImage.id
                          )
                        }
                      >
                        Copy Prompt
                      </Button>

                      {selectedImage.imageUrl && (
                        <Button
                          size="sm"
                          color="primary"
                          startContent={<BiDownload />}
                          onPress={() =>
                            handleDownloadImage(
                              selectedImage.imageUrl,
                              selectedImage.prompt
                            )
                          }
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
