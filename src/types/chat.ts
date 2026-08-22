import type { User } from "./auth";

export type MessageStatus = "pending" | "sent" | "failed";

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: Date;
  status: MessageStatus;
};

export type LastMessage = {
  text: string;
  senderId: string;
  sentAt: Date;
};

export type ConversationType = "direct" | "group";

export type Conversation = {
  id: string;
  type: ConversationType;
  title: string;
  participants: User[];
  peer?: User;
  lastMessage: LastMessage | null;
  updatedAt: Date;
  unreadCount: number;
  adminIds?: string[];
  createdById?: string;
};

export type Presence = "online" | "away" | "busy" | "offline";

export type ChatQuery<T> = {
  data: T | undefined;
  isLoading: boolean;
  isFetching?: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
};
