import { useEffect } from "react";
import { useImageStore } from "@/state/imageStore";

// Component to add sample data for testing
export default function ImageSampleDataLoader() {
  const { generateImage, images } = useImageStore();

  useEffect(() => {
    // Only add sample data if no images exist
    const addSampleData = async () => {
      // Check if there are already images - if so, don't add sample data
      if (images.length > 0) {
        return;
      }

      try {
        // Generate a sample image
        await generateImage({
          prompt:
            "A beautiful sunset over a mountain landscape, digital art, highly detailed",
          model: "stable-diffusion-xl",
          parameters: {
            width: 512,
            height: 512,
            steps: 20,
            guidanceScale: 7.5,
            batchSize: 1,
            scheduler: "DDIM",
            numInferenceSteps: 20,
          },
        });

        await generateImage({
          prompt:
            "A futuristic cityscape at night, neon lights, cyberpunk style",
          negativePrompt: "blurry, low quality",
          model: "stable-diffusion-xl",
          lora: "cyberpunk",
          parameters: {
            width: 768,
            height: 512,
            steps: 30,
            guidanceScale: 8.0,
            batchSize: 1,
            scheduler: "DDIM",
            numInferenceSteps: 30,
          },
        });
      } catch (error) {
        console.log("Sample data generation failed:", error);
      }
    };

    // Add a small delay to ensure store is initialized
    const timer = setTimeout(addSampleData, 1000);
    return () => clearTimeout(timer);
  }, [generateImage, images.length]);

  return null; // This component doesn't render anything
}
