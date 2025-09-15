import { useConversationStore } from "@/state/conversationStore";
import { useEffect } from "react";

// Component to add sample data for testing
export default function SampleDataLoader() {
  const { createConversation } = useConversationStore();

  useEffect(() => {
    // Only add sample data if no conversations exist
    const addSampleData = async () => {
      try {
        await createConversation(
          {
            model: "llama-2-7b",
            modelParameters: {
              temperature: 0.7,
              maxTokens: 2048,
              topP: 0.9,
              frequencyPenalty: 0,
              presencePenalty: 0,
            },
            systemPrompt:
              "You are a helpful AI assistant. Be concise and friendly in your responses.",
          },
          "Sample Chat"
        );

        await createConversation(
          {
            model: "llama-2-7b",
            modelParameters: {
              temperature: 0.9,
              maxTokens: 1024,
              topP: 0.8,
              frequencyPenalty: 0.1,
              presencePenalty: 0.1,
            },
          },
          "Creative Writing Assistant"
        );
      } catch (error) {
        console.log("Sample data already exists or failed to create:", error);
      }
    };

    addSampleData();
  }, [createConversation]);

  return null; // This component doesn't render anything
}
