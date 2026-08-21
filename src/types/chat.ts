import type { User } from "./auth";

/**
 * Normalized chat shapes.
 *
 * The API hands the same message out in two different forms — `_id` + an
 * ISO string over REST, `id` + epoch milliseconds over Socket.io — and the
 * same conversation in two more. Everything below the network boundary
 * speaks these types instead, so no component has to know which pipe a
 * record arrived through.
 */

/** Where a message stands with the server. The API has no read receipts;
 *  anything past `sent` is local knowledge only. */
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
  /** Peer name for a direct chat, group name for a group. */
  title: string;
  /** Always includes the signed-in user for groups; the peer alone for direct. */
  participants: User[];
  /** The other person — direct conversations only. */
  peer?: User;
  lastMessage: LastMessage | null;
  updatedAt: Date;
  unreadCount: number;
  /** Groups only. May be empty: the last admin can leave, and promotion
   *  requires an admin, so a group can end up permanently without one. */
  adminIds?: string[];
  createdById?: string;
};

/** Presence is not in the API. The UI reserves the slot; the value is
 *  currently supplied by fixtures and defaults to "offline". */
export type Presence = "online" | "away" | "busy" | "offline";

/** Mirrors the slice of an RTK Query result the chat UI consumes, so the
 *  mock hooks and the eventual real ones are interchangeable. */
export type ChatQuery<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
};
