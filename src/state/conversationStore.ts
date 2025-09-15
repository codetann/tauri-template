import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
  parameters?: any;
}

export interface Conversation {
  id: string;
  title: string;
  model: string;
  modelParameters: any;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface ChatOptions {
  model: string;
  modelParameters: {
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
  };
  systemPrompt?: string;
}

interface ConversationStore {
  // State
  conversations: Conversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  isCreatingChat: boolean;

  // Actions
  createConversation: (options: ChatOptions, title?: string) => Promise<string>;
  deleteConversation: (conversationId: string) => void;
  setActiveConversation: (conversationId: string) => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  updateConversationTitle: (conversationId: string, title: string) => void;
  clearError: () => void;
  setSearchQuery: (query: string) => void;
  setIsCreatingChat: (isCreating: boolean) => void;
}

const generateMessageId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateConversationId = () =>
  `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useConversationStore = create<ConversationStore>((set, get) => ({
  // Initial state
  conversations: [],
  activeConversationId: null,
  isLoading: false,
  error: null,
  searchQuery: "",
  isCreatingChat: false,

  // Create a new conversation
  createConversation: async (options: ChatOptions, title?: string) => {
    try {
      set({ isLoading: true, error: null });

      const conversationId = generateConversationId();
      const now = new Date();

      const newConversation: Conversation = {
        id: conversationId,
        title: title || `New Chat ${now.toLocaleDateString()}`,
        model: options.model,
        modelParameters: options.modelParameters,
        messages: options.systemPrompt
          ? [
              {
                id: generateMessageId(),
                role: "system",
                content: options.systemPrompt,
                timestamp: now,
              },
            ]
          : [],
        createdAt: now,
        updatedAt: now,
        isActive: true,
      };

      set((state) => ({
        conversations: [
          newConversation,
          ...state.conversations.map((conv) => ({ ...conv, isActive: false })),
        ],
        activeConversationId: conversationId,
        isLoading: false,
      }));

      return conversationId;
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create conversation",
        isLoading: false,
      });
      throw error;
    }
  },

  // Delete a conversation
  deleteConversation: (conversationId: string) => {
    set((state) => {
      const updatedConversations = state.conversations.filter(
        (conv) => conv.id !== conversationId
      );
      const newActiveId =
        state.activeConversationId === conversationId
          ? updatedConversations.length > 0
            ? updatedConversations[0].id
            : null
          : state.activeConversationId;

      return {
        conversations: updatedConversations,
        activeConversationId: newActiveId,
      };
    });
  },

  // Set active conversation
  setActiveConversation: (conversationId: string) => {
    set((state) => ({
      conversations: state.conversations.map((conv) => ({
        ...conv,
        isActive: conv.id === conversationId,
      })),
      activeConversationId: conversationId,
    }));
  },

  // Send a message
  sendMessage: async (conversationId: string, content: string) => {
    try {
      set({ isLoading: true, error: null });

      const state = get();
      const conversation = state.conversations.find(
        (conv) => conv.id === conversationId
      );
      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const userMessage: Message = {
        id: generateMessageId(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      // Add user message immediately
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, userMessage],
                updatedAt: new Date(),
              }
            : conv
        ),
      }));

      // Generate AI response
      const response = await invoke<{ content: string; model_used: string }>(
        "generate_content",
        {
          request: {
            model_type: "text-generation",
            prompt: content,
            parameters: {
              ...conversation.modelParameters,
              conversation_history: conversation.messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            },
            model_name: conversation.model,
          },
        }
      );

      const assistantMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: response.content || "No response generated",
        timestamp: new Date(),
        model: response.model_used,
      };

      // Add assistant message
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                messages: [...conv.messages, assistantMessage],
                updatedAt: new Date(),
              }
            : conv
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to send message",
        isLoading: false,
      });
    }
  },

  // Update conversation title
  updateConversationTitle: (conversationId: string, title: string) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? { ...conv, title, updatedAt: new Date() }
          : conv
      ),
    }));
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set search query
  setSearchQuery: (query: string) => set({ searchQuery: query }),

  // Set creating chat state
  setIsCreatingChat: (isCreating: boolean) =>
    set({ isCreatingChat: isCreating }),
}));
