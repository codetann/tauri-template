import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { BiUpload, BiFile, BiTag, BiUser, BiX, BiData } from "react-icons/bi";
import { CiCircleInfo } from "react-icons/ci";
import { useMarketplaceStore } from "@/state/marketplaceStore";

interface CustomModelImportProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { key: "text", label: "Text Models" },
  { key: "image", label: "Image Models" },
  { key: "audio", label: "Audio Models" },
  { key: "video", label: "Video Models" },
  { key: "other", label: "Other" },
];

const TYPES = [
  { key: "model", label: "Model" },
  { key: "lora", label: "LoRA" },
  { key: "embedding", label: "Embedding" },
  { key: "vae", label: "VAE" },
  { key: "scheduler", label: "Scheduler" },
];

const LICENSES = [
  { key: "MIT", label: "MIT License" },
  { key: "Apache-2.0", label: "Apache 2.0" },
  { key: "GPL-3.0", label: "GPL 3.0" },
  { key: "Creative Commons", label: "Creative Commons" },
  { key: "Custom", label: "Custom License" },
];

export default function CustomModelImport({
  isOpen,
  onClose,
}: CustomModelImportProps) {
  const { importCustomModel } = useMarketplaceStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    author: "",
    version: "1.0",
    category: "",
    type: "",
    license: "",
    tags: "",
    requirements: "",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill name from filename
      if (!formData.name) {
        setFormData((prev) => ({
          ...prev,
          name: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const requirements = formData.requirements
      .split("\n")
      .map((req) => req.trim())
      .filter((req) => req.length > 0);

    const metadata = {
      name: formData.name,
      description: formData.description,
      author: formData.author,
      version: formData.version,
      category: formData.category as any,
      type: formData.type as any,
      license: formData.license,
      tags,
      requirements,
    };

    try {
      await importCustomModel(selectedFile, metadata);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Failed to import custom model:", error);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setFormData({
      name: "",
      description: "",
      author: "",
      version: "1.0",
      category: "",
      type: "",
      license: "",
      tags: "",
      requirements: "",
    });
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const isFormValid = () => {
    return (
      selectedFile &&
      formData.name &&
      formData.description &&
      formData.author &&
      formData.category &&
      formData.type &&
      formData.license
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
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
            <div className="flex items-center gap-2">
              <BiUpload size={20} />
              <h2 className="text-xl font-semibold">Import Custom Model</h2>
            </div>
            <Button isIconOnly variant="light" onPress={handleClose}>
              <BiX />
            </Button>
          </div>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-6">
            {/* File Upload */}
            <div>
              <h3 className="font-medium mb-3">Model File</h3>
              {selectedFile ? (
                <Card className="bg-neutral-800">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <BiFile size={24} className="text-primary" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-neutral-400">
                          <div className="flex items-center gap-1">
                            <BiData size={14} />
                            <span>
                              {(selectedFile.size / (1024 * 1024)).toFixed(1)}{" "}
                              MB
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CiCircleInfo size={14} />
                            <span>{selectedFile.type || "Unknown type"}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => setSelectedFile(null)}
                      >
                        <BiX />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center">
                  <BiUpload
                    size={48}
                    className="mx-auto mb-4 text-neutral-400"
                  />
                  <p className="text-neutral-400 mb-4">
                    Drag and drop your model file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".safetensors,.bin,.pt,.pth,.ckpt,.gguf,.ggml"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="model-file-input"
                  />
                  <label htmlFor="model-file-input">
                    <Button
                      as="span"
                      color="primary"
                      variant="bordered"
                      startContent={<BiUpload />}
                    >
                      Choose File
                    </Button>
                  </label>
                  <p className="text-xs text-neutral-500 mt-2">
                    Supported formats: .safetensors, .bin, .pt, .pth, .ckpt,
                    .gguf, .ggml
                  </p>
                </div>
              )}
            </div>

            <Divider />

            {/* Model Information */}
            <div className="space-y-4">
              <h3 className="font-medium">Model Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Model Name"
                  placeholder="Enter model name"
                  value={formData.name}
                  onValueChange={(value) => handleInputChange("name", value)}
                  isRequired
                />

                <Input
                  label="Author"
                  placeholder="Enter author name"
                  value={formData.author}
                  onValueChange={(value) => handleInputChange("author", value)}
                  startContent={<BiUser />}
                  isRequired
                />

                <Input
                  label="Version"
                  placeholder="1.0"
                  value={formData.version}
                  onValueChange={(value) => handleInputChange("version", value)}
                />

                <Select
                  label="Category"
                  placeholder="Select category"
                  selectedKeys={formData.category ? [formData.category] : []}
                  onSelectionChange={(keys) =>
                    handleInputChange("category", Array.from(keys)[0] as string)
                  }
                  isRequired
                >
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.key}>{category.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Type"
                  placeholder="Select type"
                  selectedKeys={formData.type ? [formData.type] : []}
                  onSelectionChange={(keys) =>
                    handleInputChange("type", Array.from(keys)[0] as string)
                  }
                  isRequired
                >
                  {TYPES.map((type) => (
                    <SelectItem key={type.key}>{type.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="License"
                  placeholder="Select license"
                  selectedKeys={formData.license ? [formData.license] : []}
                  onSelectionChange={(keys) =>
                    handleInputChange("license", Array.from(keys)[0] as string)
                  }
                  isRequired
                >
                  {LICENSES.map((license) => (
                    <SelectItem key={license.key}>{license.label}</SelectItem>
                  ))}
                </Select>
              </div>

              <Textarea
                label="Description"
                placeholder="Describe what this model does and how to use it"
                value={formData.description}
                onValueChange={(value) =>
                  handleInputChange("description", value)
                }
                isRequired
                minRows={3}
              />

              <Input
                label="Tags"
                placeholder="Enter tags separated by commas (e.g., style, anime, realistic)"
                value={formData.tags}
                onValueChange={(value) => handleInputChange("tags", value)}
                startContent={<BiTag />}
              />

              <Textarea
                label="Requirements"
                placeholder="List any requirements (one per line)"
                value={formData.requirements}
                onValueChange={(value) =>
                  handleInputChange("requirements", value)
                }
                minRows={2}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!isFormValid()}
          >
            Import Model
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
