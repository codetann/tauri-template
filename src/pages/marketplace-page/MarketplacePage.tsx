import { useState, useEffect } from "react";
import {
  MarketplaceFilters,
  MarketplaceGrid,
  MarketplaceList,
  ModelManagement,
  CustomModelImport,
} from "@/components";
import { useMarketplaceStore } from "@/state/marketplaceStore";

export default function MarketplacePage() {
  const { loadModels, loadInstalledModels, viewMode } = useMarketplaceStore();
  const [activeTab, setActiveTab] = useState<"browse" | "manage">("browse");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    // Load models and installed models when component mounts
    loadModels();
    loadInstalledModels();
  }, [loadModels, loadInstalledModels]);

  const handleImportCustom = () => {
    setIsImportModalOpen(true);
  };

  const handleManageModels = () => {
    setActiveTab("manage");
  };

  return (
    <div className="w-full h-full">
      <div className="p-0">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-neutral-400">
            Discover, download, and manage AI models for text, image, audio, and
            video generation. All models are free and ready to use.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === "browse"
                ? "bg-[hsl(var(--heroui-primary))] text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
            onClick={() => setActiveTab("browse")}
          >
            Browse Models
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === "manage"
                ? "bg-[hsl(var(--heroui-primary))] text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
            onClick={() => setActiveTab("manage")}
          >
            Manage Installed
          </button>
        </div>

        {/* Content */}
        {activeTab === "browse" ? (
          <div className="space-y-6">
            {/* Filters */}
            <MarketplaceFilters
              onImportCustom={handleImportCustom}
              onManageModels={handleManageModels}
            />

            {/* Models View */}
            {viewMode === "grid" ? <MarketplaceGrid /> : <MarketplaceList />}
          </div>
        ) : (
          <ModelManagement />
        )}
      </div>

      {/* Custom Model Import Modal */}
      <CustomModelImport
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
