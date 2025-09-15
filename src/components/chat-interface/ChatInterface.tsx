import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardBody,
  Button,
  Textarea,
  ScrollShadow,
  Chip,
  Avatar,
} from "@heroui/react";
import { BiSend, BiUser, BiBot, BiCopy, BiCheck } from "react-icons/bi";
import { useConversationStore, Message } from "@/state/conversationStore";

interface ChatInterfaceProps {
  conversationId: string | null;
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const { conversations, sendMessage, isLoading } = useConversationStore();
  const [message, setMessage] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const conversation = conversationId
    ? conversations.find((conv) => conv.id === conversationId)
    : null;

  const messages =
    conversation?.messages.filter((msg) => msg.role !== "system") || [];

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !conversationId || isLoading) return;

    const messageToSend = message.trim();
    setMessage("");

    try {
      await sendMessage(conversationId, messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessage(messageToSend); // Restore message on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy message:", error);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(
        /`(.*?)`/g,
        '<code class="bg-neutral-800 px-1 py-0.5 rounded text-sm">$1</code>'
      )
      .replace(/\n/g, "<br>");
  };

  if (!conversation) {
    return (
      <Card className="flex-1">
        <CardBody className="flex items-center justify-center h-full">
          <div className="text-center text-neutral-500">
            <BiBot size={48} className="mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No Conversation Selected
            </h3>
            <p className="text-sm">
              Select a conversation from the list or create a new chat to start
              messaging.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col">
      <CardBody className="flex-1 flex flex-col p-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{conversation.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Chip size="sm" variant="flat" color="primary">
                  {conversation.model}
                </Chip>
                <span className="text-xs text-neutral-400">
                  {messages.length} messages
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollShadow className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <BiBot size={32} className="mx-auto mb-2" />
                <p className="text-sm">
                  Start a conversation by sending a message below.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar
                    icon={msg.role === "user" ? <BiUser /> : <BiBot />}
                    size="sm"
                    className={`${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-neutral-700 text-white"
                    }`}
                  />

                  <div
                    className={`flex-1 max-w-[80%] ${
                      msg.role === "user" ? "items-end" : "items-start"
                    } flex flex-col`}
                  >
                    <div
                      className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-primary text-white"
                          : "bg-neutral-800 text-white"
                      }`}
                    >
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: formatMessage(msg.content),
                        }}
                      />

                      {msg.model && (
                        <div className="mt-2 pt-2 border-t border-neutral-600">
                          <Chip size="sm" variant="flat" className="text-xs">
                            {msg.model}
                          </Chip>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-neutral-400">
                        {formatTime(msg.timestamp)}
                      </span>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="h-6 w-6 min-w-6"
                        onPress={() => handleCopyMessage(msg.content, msg.id)}
                      >
                        {copiedMessageId === msg.id ? (
                          <BiCheck size={12} className="text-success" />
                        ) : (
                          <BiCopy size={12} />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3">
                <Avatar
                  icon={<BiBot />}
                  size="sm"
                  className="bg-neutral-700 text-white"
                />
                <div className="flex-1">
                  <div className="p-3 rounded-lg bg-neutral-800">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-sm text-neutral-400">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollShadow>

        {/* Message Input */}
        <div className="p-4 border-t border-neutral-700">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Type your message..."
              value={message}
              onValueChange={setMessage}
              onKeyDown={handleKeyDown}
              minRows={1}
              maxRows={4}
              className="flex-1"
              classNames={{
                inputWrapper: "bg-background border-neutral-700",
              }}
              isDisabled={isLoading}
            />
            <Button
              color="primary"
              isIconOnly
              onPress={handleSendMessage}
              isLoading={isLoading}
              isDisabled={!message.trim()}
              className="self-end"
            >
              <BiSend />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-neutral-400">
              Press Enter to send, Shift+Enter for new line
            </p>
            {conversation.modelParameters && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Temperature:</span>
                <Chip size="sm" variant="flat">
                  {conversation.modelParameters.temperature}
                </Chip>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
