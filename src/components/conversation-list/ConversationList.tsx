import React, { useState, useMemo } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  ScrollShadow,
  Chip,
} from "@heroui/react";
import {
  BiSearch,
  BiPlus,
  BiMessageSquare,
  BiTrash,
  BiEdit,
  BiCheck,
  BiX,
} from "react-icons/bi";
import { useConversationStore, Conversation } from "@/state/conversationStore";

interface ConversationListProps {
  onNewChat: () => void;
}

export default function ConversationList({ onNewChat }: ConversationListProps) {
  const {
    conversations,
    activeConversationId,
    searchQuery,
    setActiveConversation,
    deleteConversation,
    updateConversationTitle,
    setSearchQuery,
  } = useConversationStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some((msg) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [conversations, searchQuery]);

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId);
  };

  const handleDeleteConversation = (
    conversationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this conversation?")) {
      deleteConversation(conversationId);
    }
  };

  const handleEditStart = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleEditSave = () => {
    if (editingId && editTitle.trim()) {
      updateConversationTitle(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const getLastMessage = (conversation: Conversation) => {
    const userMessages = conversation.messages.filter(
      (msg) => msg.role === "user"
    );
    return userMessages.length > 0
      ? userMessages[userMessages.length - 1]
      : null;
  };

  return (
    <Card className="w-80 h-full">
      <CardBody className="p-4 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <Button
            isIconOnly
            color="primary"
            variant="flat"
            size="sm"
            onPress={onNewChat}
            style={{
              backgroundColor: "hsl(var(--heroui-primary))",
              color: "hsl(var(--heroui-primary-foreground))",
            }}
          >
            <BiPlus size={18} />
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={<BiSearch size={16} />}
            size="sm"
            classNames={{
              inputWrapper: "bg-background border-neutral-700",
            }}
          />
        </div>

        {/* Conversations List */}
        <ScrollShadow className="flex-1">
          <div className="space-y-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                <BiMessageSquare size={32} className="mx-auto mb-2" />
                <p className="text-sm">
                  {searchQuery
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
                {!searchQuery && (
                  <p className="text-xs mt-1">
                    Click the + button to start a new chat
                  </p>
                )}
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                const isEditing = editingId === conversation.id;
                const lastMessage = getLastMessage(conversation);

                return (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? "bg-white/5"
                        : "hover:bg-neutral-800/50 border border-transparent"
                    }`}
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editTitle}
                              onValueChange={setEditTitle}
                              size="sm"
                              classNames={{
                                inputWrapper:
                                  "bg-background border-neutral-600",
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleEditSave();
                                if (e.key === "Escape") handleEditCancel();
                              }}
                              autoFocus
                            />
                            <Button
                              isIconOnly
                              size="sm"
                              color="success"
                              variant="light"
                              onPress={handleEditSave}
                            >
                              <BiCheck size={14} />
                            </Button>
                            <Button
                              isIconOnly
                              size="sm"
                              color="danger"
                              variant="light"
                              onPress={handleEditCancel}
                            >
                              <BiX size={14} />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm truncate">
                                {conversation.title}
                              </h3>
                              <Chip
                                size="sm"
                                variant="flat"
                                color="primary"
                                className="text-xs"
                              >
                                {conversation.model}
                              </Chip>
                            </div>

                            {lastMessage && (
                              <p className="text-xs text-neutral-400 truncate mb-1">
                                {lastMessage.content}
                              </p>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-neutral-500">
                                {formatDate(conversation.updatedAt)}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {conversation.messages.length} messages
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* {!isEditing && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            onPress={(e) => handleEditStart(conversation, e)}
                          >
                            <BiEdit size={12} />
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={(e) =>
                              handleDeleteConversation(conversation.id, e)
                            }
                          >
                            <BiTrash size={12} />
                          </Button>
                        </div>
                      )} */}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollShadow>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <Button
            color="default"
            style={{
              backgroundColor: "hsl(var(--heroui-primary))",
              color: "hsl(var(--heroui-primary-foreground))",
            }}
            variant="flat"
            className="w-full"
            startContent={<BiPlus />}
            onPress={onNewChat}
          >
            New Chat
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
