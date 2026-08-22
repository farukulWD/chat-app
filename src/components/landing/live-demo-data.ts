/** Cast and script for the hero demo. Kept apart from the component so the
 *  copy can be rewritten without touching the state machine. */

export const DEMO_CONVERSATION_ID = "68f3a2";

export const ME = {
  id: "demo-you",
  name: "You",
  phone: "+880 1712 000111",
} as const;

export const PEER = {
  id: "demo-rafi",
  name: "Rafi Ahmed",
  phone: "+880 1712 000222",
} as const;

export const SEED: { from: string; text: string; minutesAgo: number }[] = [
  {
    from: PEER.id,
    text: "Are we still on for the 4pm review?",
    minutesAgo: 12,
  },
  { from: ME.id, text: "Yes — pushing the last commit now.", minutesAgo: 11 },
  { from: PEER.id, text: "Anything I should look at first?", minutesAgo: 9 },
  { from: ME.id, text: "The message list. Start there.", minutesAgo: 8 },
  {
    from: PEER.id,
    text: "Perfect. Send me a shout when it's up.",
    minutesAgo: 6,
  },
];

/** What the peer says back, in order, cycling if you keep typing. */
export const PEER_REPLIES: string[] = [
  "Got it — that landed on my screen the moment you sent it.",
  "No refresh, no polling. The socket pushed it straight here.",
  "Try scrolling up while I keep talking — the view won't yank you down.",
  "Same thing works in a group. Add three people and it still holds.",
  "That's the whole idea: you type, it arrives. Nothing in between.",
];

export const PEER_NUDGE = "Go on — type something. It shows up on my side.";
