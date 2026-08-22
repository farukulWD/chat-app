import { API_DOCS_URL, POSTMAN_URL, REPO_URL, SWAGGER_URL } from "./links";

/* What the guide knows. It is a lookup table, not a model: every answer here
   is a fact about this build, so it can never invent one. */

export type BotLink = { label: string; href: string; external?: boolean };

export type BotTopic = {
  id: string;
  /** Short label for the suggestion chip. */
  chip: string;
  /** Lowercase fragments that point at this topic. */
  keywords: string[];
  answer: string;
  links?: BotLink[];
  /** Topics worth offering once this one is answered. */
  next?: string[];
};

export const GREETING =
  "Ask me about how this thing works. I'm a scripted guide — a lookup table, not an AI — so I only know what's actually in this build.";

export const FALLBACK =
  "That one isn't in my table, so I won't guess. Here's what I can answer:";

export const TOPICS: BotTopic[] = [
  {
    id: "signin",
    chip: "How do I sign in?",
    keywords: [
      "sign in",
      "signin",
      "login",
      "log in",
      "register",
      "sign up",
      "signup",
      "account",
      "password",
      "phone",
      "number",
      "otp",
    ],
    answer:
      "With a phone number and a name — that's the whole form. There is no separate registration flow: if the number has never been seen, the API registers it as a new user on the spot. No password, no OTP, no email.",
    links: [{ label: "Open the app", href: "/chat" }],
    next: ["start", "groups"],
  },
  {
    id: "start",
    chip: "Starting a conversation",
    keywords: [
      "start",
      "new chat",
      "new conversation",
      "search",
      "find",
      "contact",
      "who",
      "person",
      "direct",
      "one to one",
    ],
    answer:
      "Search by name or by number, pick the person, and the conversation opens. Matches come back as you type, so you never have to know an exact spelling.",
    next: ["groups", "realtime"],
  },
  {
    id: "groups",
    chip: "Do groups work?",
    keywords: [
      "group",
      "groups",
      "members",
      "member",
      "admin",
      "participants",
      "add people",
      "remove",
      "rename",
    ],
    answer:
      "Yes. Pick several people in the same search, name the group, and it exists. Admins can rename it, add members and remove them afterwards, and every participant's list updates from the same socket event — including the person who just lost access.",
    next: ["realtime", "scroll"],
  },
  {
    id: "realtime",
    chip: "Is it really real-time?",
    keywords: [
      "real time",
      "realtime",
      "socket",
      "websocket",
      "live",
      "refresh",
      "poll",
      "instant",
      "delivery",
      "receipt",
      "tick",
      "presence",
      "online",
    ],
    answer:
      "Socket.io, no polling. message:new puts an incoming message into the open thread and moves the conversation to the top of the list in the same tick. conversation:updated carries group changes. If the socket drops, your own status dims and the client re-syncs on reconnect instead of pretending the gap never happened.",
    next: ["scroll", "stack"],
  },
  {
    id: "scroll",
    chip: "What is auto-scroll etiquette?",
    keywords: [
      "scroll",
      "auto scroll",
      "autoscroll",
      "jump",
      "pill",
      "bottom",
      "read earlier",
      "history",
    ],
    answer:
      "At the bottom of a thread, the view follows every new message. Scroll up to read something and it freezes exactly where you left it, counts what arrived, and offers a pill to come back. There's a working demo of it in the Craft section of this page.",
    next: ["failed", "stack"],
  },
  {
    id: "failed",
    chip: "What if a message fails?",
    keywords: [
      "fail",
      "failed",
      "error",
      "offline",
      "retry",
      "not sent",
      "empty",
      "wrong",
      "broken",
    ],
    answer:
      "It keeps its text on screen, marks itself Not sent, and offers one retry — nothing is silently swallowed. Empty messages never leave the composer in the first place. Loading and empty states each have a real screen too.",
    next: ["scroll", "stack"],
  },
  {
    id: "stack",
    chip: "What's it built with?",
    keywords: [
      "stack",
      "tech",
      "built",
      "framework",
      "next",
      "react",
      "typescript",
      "tailwind",
      "redux",
      "library",
      "code",
    ],
    answer:
      "Next.js 16 with the App Router, React 19, TypeScript, Tailwind CSS v4, RTK Query for the REST calls and Socket.io for delivery. The landing page you're on reuses the app's own components — this bubble you're reading is the same one the chat panel renders.",
    links: [{ label: "View the source", href: REPO_URL, external: true }],
    next: ["docs", "about"],
  },
  {
    id: "docs",
    chip: "Where are the API docs?",
    keywords: [
      "api",
      "docs",
      "documentation",
      "endpoint",
      "swagger",
      "postman",
      "collection",
      "reference",
    ],
    answer:
      "There's a written reference covering every endpoint, the error model and the socket events, plus a Postman collection that runs end to end with no ids pasted by hand. The API's own Swagger document is request-only, so the response shapes in the reference came from exercising the live API.",
    links: [
      { label: "API reference", href: API_DOCS_URL, external: true },
      { label: "Postman collection", href: POSTMAN_URL, external: true },
      { label: "Swagger source", href: SWAGGER_URL, external: true },
    ],
    next: ["about"],
  },
  {
    id: "about",
    chip: "Is this a real product?",
    keywords: [
      "real",
      "product",
      "company",
      "who made",
      "take home",
      "assignment",
      "task",
      "portfolio",
      "demo",
      "free",
      "price",
      "cost",
    ],
    answer:
      "No — Chat app is the name given to a take-home build for a frontend role. The chat app behind it is fully working against a provided API, but there's no company, no pricing and no signup to worry about.",
    links: [{ label: "Open the app", href: "/chat" }],
    next: ["stack", "docs"],
  },
];

export const OPENING_CHIPS = ["signin", "realtime", "groups", "stack"];

const normalise = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

export function findTopic(input: string): BotTopic | null {
  const text = ` ${normalise(input)} `;

  let best: BotTopic | null = null;
  let bestScore = 0;

  for (const topic of TOPICS) {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (text.includes(` ${keyword} `) || text.includes(`${keyword} `)) {
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      best = topic;
      bestScore = score;
    }
  }

  return best;
}

export const topicById = (id: string): BotTopic | undefined =>
  TOPICS.find((topic) => topic.id === id);
