import type { ApiMessage, ApiSocketMessage } from "@/types/api";
import type { Message } from "@/types/chat";

const toDate = (value: string | number | undefined): Date => {
  if (value === undefined || value === null) return new Date();

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

export const fromRestMessage = (raw: ApiMessage): Message => {
  return {
    id: raw._id,
    conversationId: raw.conversation,
    senderId: raw.sender,
    text: raw.text ?? "",
    sentAt: toDate(raw.createdAt),
    status: "sent",
  };
};

export const fromSocketMessage = (raw: ApiSocketMessage): Message => {
  return {
    id: raw.id,
    conversationId: raw.conversation,
    senderId: raw.sender,
    text: raw.text ?? "",
    sentAt: toDate(raw.createdAt),
    status: "sent",
  };
};

export const byOldestFirst = (a: Message, b: Message): number => {
  const delta = a.sentAt.getTime() - b.sentAt.getTime();
  return delta !== 0 ? delta : a.id.localeCompare(b.id);
};

export const mergeMessages = (
  existing: readonly Message[],
  incoming: readonly Message[],
): Message[] => {
  const byId = new Map<string, Message>();

  for (const message of existing) byId.set(message.id, message);
  for (const message of incoming) byId.set(message.id, message);

  return [...byId.values()].sort(byOldestFirst);
};
