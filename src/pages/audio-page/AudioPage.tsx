import { useEffect } from "react";
import {
  AudioList,
  AudioFloatingInput,
  AudioSampleDataLoader,
} from "@/components";
import { useAudioStore } from "@/state/audioStore";

export default function AudioPage() {
  const { loadModels } = useAudioStore();

  useEffect(() => {
    // Load models when component mounts
    loadModels();
  }, [loadModels]);

  return (
    <div className="w-full h-full relative">
      {/* Sample Data Loader for Development */}
      <AudioSampleDataLoader />

      {/* Main Content */}
      <div className="p-6 pb-32">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">AI Audio Generation</h1>
          <p className="text-neutral-400">
            Generate music and speech using AI models. Use the floating input
            below for quick generation.
          </p>
        </div>

        {/* Audio List */}
        <AudioList />
      </div>

      {/* Floating Input */}
      <AudioFloatingInput />
    </div>
  );
}
