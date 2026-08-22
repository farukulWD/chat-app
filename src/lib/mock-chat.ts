import type { User } from "@/types/auth";
import type { Presence } from "@/types/chat";

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

export function getPresence(userId: string): Presence | undefined {
  return PRESENCE[userId];
}
