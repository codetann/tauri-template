import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Progress,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
} from "@heroui/react";
import {
  BiDownload,
  BiTrash,
  BiStar,
  BiUser,
  BiCalendar,
  BiCheck,
  BiX,
  BiPlay,
  BiPause,
  BiRefresh,
} from "react-icons/bi";
import { CiCircleInfo } from "react-icons/ci";
import { RiHardDrive2Line } from "react-icons/ri";
import { MarketplaceModel } from "@/state/marketplaceStore";

interface ModelCardProps {
  model: MarketplaceModel;
  onDownload: (modelId: string) => void;
  onInstall: (modelId: string) => void;
  onUninstall: (modelId: string) => void;
}

// Helper function to format file size
const formatFileSize = (sizeInMB: number): string => {
  if (sizeInMB >= 1024) {
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  }
  return `${sizeInMB} MB`;
};

// Helper function to format download count
const formatDownloads = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function ModelCard({
  model,
  onDownload,
  onInstall,
  onUninstall,
}: ModelCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAction = () => {
    if (model.isInstalled) {
      onUninstall(model.id);
    } else if (model.isDownloaded) {
      onInstall(model.id);
    } else {
      onDownload(model.id);
    }
  };

  const getActionButton = () => {
    if (model.isDownloading) {
      return (
        <Button
          color="primary"
          variant="flat"
          isDisabled
          startContent={<BiRefresh className="animate-spin" />}
        >
          Downloading...
        </Button>
      );
    }

    if (model.isInstalled) {
      return (
        <Button
          color="danger"
          variant="flat"
          startContent={<BiTrash />}
          onPress={handleAction}
        >
          Uninstall
        </Button>
      );
    }

    if (model.isDownloaded) {
      return (
        <Button
          color="success"
          startContent={<BiCheck />}
          onPress={handleAction}
        >
          Install
        </Button>
      );
    }

    return (
      <Button
        color="primary"
        startContent={<BiDownload />}
        onPress={handleAction}
      >
        Download
      </Button>
    );
  };

  const getStatusChip = () => {
    if (model.isInstalled) {
      return (
        <Chip size="sm" color="success" startContent={<BiCheck />}>
          Installed
        </Chip>
      );
    }
    if (model.isDownloaded) {
      return (
        <Chip size="sm" color="warning" startContent={<RiHardDrive2Line />}>
          Downloaded
        </Chip>
      );
    }
    if (model.isDownloading) {
      return (
        <Chip size="sm" color="primary" startContent={<BiDownload />}>
          Downloading
        </Chip>
      );
    }
    return null;
  };

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardBody className="p-4">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{model.name}</h3>
                <p className="text-sm text-neutral-400 truncate">
                  {model.author}
                </p>
              </div>
              {getStatusChip()}
            </div>

            {/* Description */}
            <p className="text-sm text-neutral-300 mb-3 line-clamp-2 flex-1">
              {model.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {model.tags.slice(0, 3).map((tag) => (
                <Chip key={tag} size="sm" variant="flat" color="default">
                  {tag}
                </Chip>
              ))}
              {model.tags.length > 3 && (
                <Chip size="sm" variant="flat" color="default">
                  +{model.tags.length - 3}
                </Chip>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-neutral-400 mb-3">
              <div className="flex items-center gap-1">
                <BiStar className="text-yellow-400" />
                <span>{model.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <BiDownload />
                <span>{formatDownloads(model.downloads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <RiHardDrive2Line />
                <span>{formatFileSize(model.size)}</span>
              </div>
            </div>

            {/* Download Progress */}
            {model.isDownloading && (
              <div className="mb-3">
                <Progress
                  value={model.downloadProgress}
                  className="max-w-md"
                  color="primary"
                  size="sm"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  {model.downloadProgress}% downloaded
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              {getActionButton()}
              <Button
                variant="light"
                isIconOnly
                size="sm"
                onPress={() => setIsModalOpen(true)}
              >
                <CiCircleInfo />
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Model Details Modal */}
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
                <h2 className="text-xl font-semibold">{model.name}</h2>
                <p className="text-sm text-neutral-400">
                  by {model.author} • v{model.version}
                </p>
              </div>
              {getStatusChip()}
            </div>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-neutral-300">{model.description}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">Rating</h4>
                  <div className="flex items-center gap-1">
                    <BiStar className="text-yellow-400" />
                    <span className="text-sm">
                      {model.rating.toFixed(1)}/5.0
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-800 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">Downloads</h4>
                  <p className="text-sm">{formatDownloads(model.downloads)}</p>
                </div>

                <div className="bg-neutral-800 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">Size</h4>
                  <p className="text-sm">{formatFileSize(model.size)}</p>
                </div>

                <div className="bg-neutral-800 p-3 rounded-lg">
                  <h4 className="text-sm font-medium mb-1">License</h4>
                  <p className="text-sm">{model.license}</p>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag) => (
                    <Chip key={tag} size="sm" variant="flat" color="default">
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              {model.requirements.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {model.requirements.map((req, index) => (
                      <li key={index} className="text-sm text-neutral-300">
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Metadata */}
              {model.metadata && (
                <div>
                  <h3 className="font-medium mb-2">Technical Details</h3>
                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(model.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-neutral-400 capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </span>
                          <span className="text-neutral-200">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Installation Path */}
              {model.isInstalled && model.installedPath && (
                <div>
                  <h3 className="font-medium mb-2">Installation</h3>
                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <p className="text-sm text-neutral-300">
                      <span className="text-neutral-400">Path:</span>{" "}
                      {model.installedPath}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              Close
            </Button>
            {getActionButton()}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
