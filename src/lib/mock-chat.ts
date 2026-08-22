import type { User } from "@/types/auth";
import type { Message, Presence } from "@/types/chat";

/**
 * Fixtures for the parts of the chat that are not wired to the API yet —
 * message history, and presence (which the API has no concept of at all).
 * Conversations, user search and conversation creation are live; see
 * `@/redux/api/conversations-api` and `@/redux/api/users-api`.
 */

const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const ago = (ms: number) => new Date(Date.now() - ms);

export const MOCK_PEOPLE = {
  nadia: {
    _id: "6a90a1c4e5d6aac975220001",
    name: "Nadia Rahman",
    phone: "+8801712345601",
  },
  tanvir: {
    _id: "6a90a1c4e5d6aac975220002",
    name: "Tanvir Hasan",
    phone: "+8801712345602",
  },
  priya: {
    _id: "6a90a1c4e5d6aac975220003",
    name: "Priya Chowdhury",
    phone: "+8801712345603",
  },
  arif: {
    _id: "6a90a1c4e5d6aac975220004",
    name: "Arif Mahmud",
    phone: "+8801712345604",
  },
  sabbir: {
    _id: "6a90a1c4e5d6aac975220005",
    name: "Sabbir Ahmed",
    phone: "+8801712345605",
  },
} satisfies Record<string, User>;

const PRESENCE: Record<string, Presence> = {
  [MOCK_PEOPLE.nadia._id]: "online",
  [MOCK_PEOPLE.tanvir._id]: "online",
  [MOCK_PEOPLE.priya._id]: "away",
  [MOCK_PEOPLE.arif._id]: "busy",
  [MOCK_PEOPLE.sabbir._id]: "offline",
};

export function getPresence(userId: string): Presence {
  return PRESENCE[userId] ?? "offline";
}

export const CONVERSATION_IDS = {
  nadia: "6a90b2d5e5d6aac975221001",
  designTeam: "6a90b2d5e5d6aac975221002",
  tanvir: "6a90b2d5e5d6aac975221003",
  priya: "6a90b2d5e5d6aac975221004",
  football: "6a90b2d5e5d6aac975221005",
  arif: "6a90b2d5e5d6aac975221006",
  sabbir: "6a90b2d5e5d6aac975221007",
} as const;

type Seed = [
  senderKey: "me" | keyof typeof MOCK_PEOPLE,
  text: string,
  agoMs: number,
];

const THREADS: Record<string, Seed[]> = {
  [CONVERSATION_IDS.nadia]: [
    ["nadia", "Morning! Did the design tokens land in main?", DAY + 6 * HOUR],
    ["me", "They did — merged last night.", DAY + 5.9 * HOUR],
    [
      "me",
      "Palette, radii and the chat surfaces are all in there.",
      DAY + 5.88 * HOUR,
    ],
    [
      "nadia",
      "Amazing. I'll rebase the roster work on top of it.",
      DAY + 5.5 * HOUR,
    ],
    ["nadia", "One thing — is the peer bubble token final?", DAY + 5.4 * HOUR],
    [
      "me",
      "Final. It's the same neutral as the secondary surface, so it reads as a card rather than a colour.",
      DAY + 5 * HOUR,
    ],
    ["nadia", "That solves the dark mode glare, nice.", DAY + 4.8 * HOUR],
    [
      "me",
      "Exactly why it's neutral. The blue only carries your own messages.",
      5 * HOUR,
    ],
    ["nadia", "Ok. Pushing the list rows now.", 3 * HOUR],
    [
      "nadia",
      "Do you want unread counts on group rows too, or direct only?",
      2.4 * HOUR,
    ],
    ["me", "Both. Same badge, no special case.", 2.2 * HOUR],
    ["nadia", "Done. Also added the empty state you sketched.", 40 * MINUTE],
    [
      "me",
      "Perfect — I'll push the branch tonight so you can look first thing.",
      12 * MINUTE,
    ],
    [
      "nadia",
      "Perfect — I'll push the branch tonight so you can look first thing.",
      4 * MINUTE,
    ],
  ],
  [CONVERSATION_IDS.designTeam]: [
    ["tanvir", "Spacing scale review — anyone free at 3?", 4 * HOUR],
    ["priya", "Works for me.", 3.8 * HOUR],
    ["me", "Same. I'll bring the density comparison.", 3.5 * HOUR],
    [
      "nadia",
      "Can we also look at the composer height on small screens?",
      2 * HOUR,
    ],
    ["priya", "Please. It eats half the viewport on my phone.", 1.9 * HOUR],
    [
      "me",
      "Noted — it caps at four lines now and scrolls after that.",
      1.5 * HOUR,
    ],
    [
      "tanvir",
      "Dropped the revised spacing scale in the shared file.",
      52 * MINUTE,
    ],
  ],
  [CONVERSATION_IDS.tanvir]: [
    ["tanvir", "Are we still on for the review tomorrow?", 6 * HOUR],
    ["me", "Yes, 11am.", 5.5 * HOUR],
    ["me", "Sounds good, talk tomorrow.", 5 * HOUR],
  ],
  [CONVERSATION_IDS.priya]: [],
  [CONVERSATION_IDS.football]: [
    ["sabbir", "Who's in for Saturday?", 2 * DAY],
    ["tanvir", "In.", 2 * DAY - HOUR],
    ["me", "In.", 2 * DAY - 2 * HOUR],
    [
      "arif",
      "Pitch is booked for 7. Don't be late this time 😄",
      DAY + 2 * HOUR,
    ],
  ],
  [CONVERSATION_IDS.arif]: [
    ["me", "Sent the file over.", 3 * DAY - HOUR],
    ["arif", "Got it, thanks!", 3 * DAY],
  ],
  [CONVERSATION_IDS.sabbir]: [
    ["me", "Any word on the invoice?", 9 * DAY + HOUR],
    [
      "sabbir",
      "Long one for you: the invoice went out Monday, the client confirmed receipt Tuesday, and finance said the transfer clears by Friday.",
      9 * DAY,
    ],
  ],
};

export function createMockMessages(
  meId: string,
  conversationId: string,
): Message[] {
  const seeds = THREADS[conversationId] ?? [];

  return seeds.map(([senderKey, text, agoMs], index) => ({
    id: `${conversationId}-m${index}`,
    conversationId,
    senderId: senderKey === "me" ? meId : MOCK_PEOPLE[senderKey]._id,
    text,
    sentAt: ago(agoMs),
    status: "sent" as const,
  }));
}

