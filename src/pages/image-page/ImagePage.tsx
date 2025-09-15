import { useState, useEffect } from "react";
import {
  ImageGrid,
  FloatingInput,
  AdvancedSettingsDrawer,
  ImageSampleDataLoader,
} from "@/components";
import { useImageStore } from "@/state/imageStore";

export default function ImagePage() {
  const { loadModels, loadLoras } = useImageStore();
  const [isAdvancedDrawerOpen, setIsAdvancedDrawerOpen] = useState(false);

  useEffect(() => {
    // Load models and LoRAs when component mounts
    loadModels();
    loadLoras();
  }, [loadModels, loadLoras]);

  const handleOpenAdvancedSettings = () => {
    setIsAdvancedDrawerOpen(true);
  };

  const handleCloseAdvancedSettings = () => {
    setIsAdvancedDrawerOpen(false);
  };

  return (
    <div className="w-full h-full relative">
      {/* Load sample data for development */}
      <ImageSampleDataLoader />

      {/* Main Content */}
      <div className="p-6 pb-32">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Image Generation</h1>
          <p className="text-neutral-400">
            Generate stunning images using AI models. Use the floating input
            below for quick generation or open advanced settings for more
            control.
          </p>
        </div>

        {/* Image Grid */}
        <ImageGrid />
      </div>

      {/* Floating Input */}
      {!isAdvancedDrawerOpen && (
        <FloatingInput onOpenAdvancedSettings={handleOpenAdvancedSettings} />
      )}

      {/* Advanced Settings Drawer */}
      <AdvancedSettingsDrawer
        isOpen={isAdvancedDrawerOpen}
        onClose={handleCloseAdvancedSettings}
      />
    </div>
  );
}
