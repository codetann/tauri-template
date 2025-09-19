import { useState } from "react";
import {
  ConversationList,
  NewChatModal,
  ChatInterface,
  SampleDataLoader,
} from "@/components";
import { useConversationStore } from "@/state/conversationStore";

export default function TextPage() {
  const { activeConversationId, createConversation } = useConversationStore();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  const handleCreateChat = async (options: any, title?: string) => {
    try {
      await createConversation(options, title);
      setIsNewChatModalOpen(false);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  return (
    <div className="w-full h-full flex gap-4">
      {/* Load sample data for development */}
      <SampleDataLoader />

      {/* Conversation List */}
      <ConversationList onNewChat={() => setIsNewChatModalOpen(true)} />

      {/* Chat Interface */}
      <ChatInterface conversationId={activeConversationId} />

      {/* New Chat Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  );
}
