import { useEffect } from "react";
import { useAudioStore } from "@/state/audioStore";

// Component to add sample data for testing
export default function AudioSampleDataLoader() {
  const { generateAudio, audios } = useAudioStore();

  useEffect(() => {
    // Only add sample data if no audios exist
    const addSampleData = async () => {
      // Check if there are already audios - if so, don't add sample data
      if (audios.length > 0) {
        return;
      }

      try {
        // Generate sample music
        await generateAudio({
          prompt:
            "A peaceful ambient soundtrack with soft piano and gentle strings, perfect for relaxation",
          model: "musicgen-stereo",
          generationType: "text-to-audio",
          parameters: {
            duration: 30,
            format: "mp3",
            volume: 0.8,
          },
        });

        // Generate sample speech
        await generateAudio({
          prompt:
            "Welcome to our AI audio generation platform. Here you can create amazing music and speech using artificial intelligence.",
          model: "tts-v1",
          generationType: "text-to-speech",
          parameters: {
            format: "mp3",
            voice: "female",
            speed: 1.0,
            pitch: 1.0,
            volume: 0.9,
          },
        });

        // Generate another music sample
        await generateAudio({
          prompt:
            "Upbeat electronic music with synthesizers and drums, energetic and modern",
          model: "musicgen-stereo",
          generationType: "text-to-audio",
          parameters: {
            duration: 45,
            format: "mp3",
            volume: 0.7,
          },
        });
      } catch (error) {
        console.log("Sample data generation failed:", error);
      }
    };

    // Add a small delay to ensure store is initialized
    const timer = setTimeout(addSampleData, 1000);
    return () => clearTimeout(timer);
  }, [generateAudio, audios.length]);

  return null; // This component doesn't render anything
}
