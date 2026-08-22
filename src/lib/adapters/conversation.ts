import type { User } from "@/types/auth";
import type { ApiConversation, ApiLastMessage, ApiUser } from "@/types/api";
import type { Conversation, LastMessage } from "@/types/chat";

/**
 * The network boundary for conversations.
 *
 * `GET /conversations` returns two different shapes under one array — a direct
 * conversation carries `participant` (singular, the other person), a group
 * carries `name` / `admins` / `participants`. Everything downstream sees one
 * `Conversation` instead.
 */

const UNKNOWN_PERSON = "Unknown";
const UNTITLED_GROUP = "Untitled group";

const toUser = (person: ApiUser): User => ({
  _id: person._id,
  name: person.name,
  phone: person.phone,
});

/** `new Date(undefined)` and `new Date("nonsense")` both yield an Invalid
 *  Date, which throws on `.toISOString()` deep inside a render. Nothing past
 *  this point is allowed to hold one. */
const toDate = (value: string | undefined): Date | null => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * A conversation with no messages is `lastMessage: null` on most rows but
 * `lastMessage: {}` on some — an empty object with no `text`, `sender` or
 * `createdAt`. Both mean the same thing, and both collapse to `null` here.
 */
const toLastMessage = (last: ApiLastMessage | null): LastMessage | null => {
  const sentAt = toDate(last?.createdAt);
  if (!last || !sentAt) return null;

  return {
    text: last.text ?? "",
    senderId: last.sender ?? "",
    sentAt,
  };
};

export function toConversation(raw: ApiConversation): Conversation {
  const lastMessage = toLastMessage(raw.lastMessage);

  const shared = {
    id: raw._id,
    lastMessage,
    // Falls back through the last message, then to the epoch, so an
    // unparseable stamp sorts last instead of poisoning the comparator.
    updatedAt: toDate(raw.updatedAt) ?? lastMessage?.sentAt ?? new Date(0),
    // The API carries no unread count. Nothing here invents one.
    unreadCount: 0,
  };

  if (raw.type === "group") {
    return {
      ...shared,
      type: "group",
      title: raw.name?.trim() || UNTITLED_GROUP,
      participants: (raw.participants ?? []).map(toUser),
      adminIds: raw.admins ?? [],
      createdById: raw.createdBy,
    };
  }

  const peer = raw.participant ? toUser(raw.participant) : undefined;

  return {
    ...shared,
    type: "direct",
    title: peer?.name.trim() || UNKNOWN_PERSON,
    participants: peer ? [peer] : [],
    peer,
  };
}

/**
 * Newest first. The server already sorts this way, so this is a guard rather
 * than a fix — local reordering from `message:new` has no such guarantee.
 */
export function byRecencyDesc(a: Conversation, b: Conversation): number {
  return b.updatedAt.getTime() - a.updatedAt.getTime();
}
