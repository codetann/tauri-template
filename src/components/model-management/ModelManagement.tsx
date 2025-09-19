import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";
import {
  BiTrash,
  BiRefresh,
  BiCalendar,
  BiUser,
  BiTag,
  BiCheck,
  BiX,
  BiPlay,
  BiPause,
} from "react-icons/bi";
import { CiCircleInfo } from "react-icons/ci";
import { RiHardDrive2Line } from "react-icons/ri";
import { useMarketplaceStore, InstalledModel } from "@/state/marketplaceStore";

// Helper function to format file size
const formatFileSize = (sizeInMB: number): string => {
  if (sizeInMB >= 1024) {
    return `${(sizeInMB / 1024).toFixed(1)} GB`;
  }
  return `${sizeInMB} MB`;
};

// Helper function to format date
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export default function ModelManagement() {
  const { installedModels, uninstallModel } = useMarketplaceStore();
  const [selectedModel, setSelectedModel] = useState<InstalledModel | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleUninstall = async (model: InstalledModel) => {
    if (confirm(`Are you sure you want to uninstall "${model.name}"?`)) {
      await uninstallModel(model.id);
    }
  };

  const handleToggleActive = (model: InstalledModel) => {
    // In a real implementation, this would update the model's active state
    console.log(`Toggle active state for ${model.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Model Management</h2>
          <p className="text-neutral-400">
            Manage your installed models and their configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="bordered"
            startContent={<BiRefresh />}
            onPress={() => window.location.reload()}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-800/50">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Models</p>
                <p className="text-2xl font-bold">{installedModels.length}</p>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-neutral-800/50">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Active Models</p>
                <p className="text-2xl font-bold">
                  {installedModels.filter((m) => m.isActive).length}
                </p>
              </div>
              <div className="text-2xl">✅</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-neutral-800/50">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Total Size</p>
                <p className="text-2xl font-bold">
                  {formatFileSize(
                    installedModels.reduce((sum, m) => sum + m.size, 0)
                  )}
                </p>
              </div>
              <div className="text-2xl">💾</div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-neutral-800/50">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-400">Categories</p>
                <p className="text-2xl font-bold">
                  {new Set(installedModels.map((m) => m.category)).size}
                </p>
              </div>
              <div className="text-2xl">🏷️</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Models Table */}
      <Card>
        <CardBody className="p-0">
          <Table aria-label="Installed models table">
            <TableHeader>
              <TableColumn>MODEL</TableColumn>
              <TableColumn>CATEGORY</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>SIZE</TableColumn>
              <TableColumn>INSTALLED</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody>
              {installedModels.map((model) => (
                <TableRow key={model.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{model.name}</p>
                      <p className="text-sm text-neutral-400">
                        v{model.version}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="primary">
                      {model.category}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat" color="secondary">
                      {model.type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <RiHardDrive2Line size={14} />
                      <span>{formatFileSize(model.size)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <BiCalendar size={14} />
                      <span className="text-sm">
                        {formatDate(model.installedAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={model.isActive ? "success" : "default"}
                      startContent={model.isActive ? <BiCheck /> : <BiX />}
                    >
                      {model.isActive ? "Active" : "Inactive"}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color={model.isActive ? "warning" : "success"}
                        onPress={() => handleToggleActive(model)}
                      >
                        {model.isActive ? <BiPause /> : <BiPlay />}
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => {
                          setSelectedModel(model);
                          setIsModalOpen(true);
                        }}
                      >
                        <CiCircleInfo />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => handleUninstall(model)}
                      >
                        <BiTrash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Model Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
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
                <h2 className="text-xl font-semibold">{selectedModel?.name}</h2>
                <p className="text-sm text-neutral-400">
                  v{selectedModel?.version}
                </p>
              </div>
              <Chip
                size="sm"
                color={selectedModel?.isActive ? "success" : "default"}
                startContent={selectedModel?.isActive ? <BiCheck /> : <BiX />}
              >
                {selectedModel?.isActive ? "Active" : "Inactive"}
              </Chip>
            </div>
          </ModalHeader>

          <ModalBody>
            {selectedModel && (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Category</h4>
                    <Chip size="sm" variant="flat" color="primary">
                      {selectedModel.category}
                    </Chip>
                  </div>

                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Type</h4>
                    <Chip size="sm" variant="flat" color="secondary">
                      {selectedModel.type}
                    </Chip>
                  </div>

                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Size</h4>
                    <div className="flex items-center gap-1">
                      <RiHardDrive2Line size={14} />
                      <span className="text-sm">
                        {formatFileSize(selectedModel.size)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">Installed</h4>
                    <div className="flex items-center gap-1">
                      <BiCalendar size={14} />
                      <span className="text-sm">
                        {formatDate(selectedModel.installedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Installation Path */}
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Installation Path
                  </h4>
                  <div className="bg-neutral-800 p-3 rounded-lg">
                    <p className="text-sm text-neutral-300 font-mono">
                      {selectedModel.path}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Actions</h4>
                  <div className="flex gap-2">
                    <Button
                      variant="bordered"
                      color={selectedModel.isActive ? "warning" : "success"}
                      startContent={
                        selectedModel.isActive ? <BiPause /> : <BiPlay />
                      }
                      onPress={() => handleToggleActive(selectedModel)}
                    >
                      {selectedModel.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      color="danger"
                      variant="bordered"
                      startContent={<BiTrash />}
                      onPress={() => {
                        setIsModalOpen(false);
                        handleUninstall(selectedModel);
                      }}
                    >
                      Uninstall
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="light" onPress={() => setIsModalOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
