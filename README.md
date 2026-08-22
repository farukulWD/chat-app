# Chat App

A real-time 1-to-1 and group chat application.

**Stack** — Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Redux Toolkit . RTK Query · Socket.io

## Live demo

|                           |                                            |
| ------------------------- | ------------------------------------------ |
| **Part 2 — landing page** | <https://chatapp-taghyeer.vercel.app/>     |
| **Part 1 — chat app**     | <https://chatapp-taghyeer.vercel.app/chat> |
| **Repository**            | <https://github.com/farukulWD/chat-app>    |

Both parts are one Next.js deploy: the landing page is the root route, the chat app lives under `/chat`.
Signed out, `/chat` sends you to the login screen and returns you there once you're in — any phone number
works, since an unknown number registers itself.

## Part 1 — API documentation

Documenting the provided API is the first deliverable, and it is complete:

| Deliverable                                                                      | What it is                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`docs/api/README.md`](docs/api/README.md)                                       | Full written reference — every endpoint with request and response schemas, status codes, the error model, Socket.io events, client integration notes, a catalogue of 16 API defects found while probing, and a redesign appendix |
| [`docs/api/Chat.postman_collection.json`](docs/api/Chat.postman_collection.json) | The same contract in executable form — 17 requests across 7 folders, chained so the whole collection runs end to end with no ids pasted by hand, with 44 real captured responses saved as examples                               |

The API's own Swagger document is deliberately request-only — it specifies no response bodies and no status
codes, and says that documenting them is part of the task. Everything in these two files was established by
exercising the live API against four fixture accounts over both REST and Socket.io.

Verify the collection against the live API at any time:

```bash
npx newman run docs/api/Chat.postman_collection.json --timeout-request 90000
# 17 requests · 43 assertions · 0 failures
```

## Project layout

```
docs/api/            Part 1 API documentation — reference + Postman collection
src/app/             Next.js App Router — (auth), (chat) and (landing) route groups
src/components/      chat/ · landing/ · ui/ (primitives) · auth/ · brand/ · theme/
src/redux/           RTK Query endpoints (api/) and client-only state (features/)
src/lib/             adapters, error mapping, phone + date formatting, socket, tokens
src/hooks/           auto-scroll, chat data access, presence, debounce, motion
src/providers/       Redux, auth bootstrap, Socket.io lifecycle
src/proxy.ts         Edge auth gate for /chat and /login
```

## Part 3 — Write-up

### How I worked

One branch per vertical slice, one pull request each, twelve merged in order:

```
part1/api-docs → route-groups → design-system → state-management/redux-axios-rtk-setup
→ auth/setup-and-login → chat/responsive-layouts → chat/conversations-list-api
→ chat/new-conversation-apis → chat/messages-realtime → chat/group-management
→ part2/landing-page-design
```

The API documentation shipped before any UI code. That was the order the assignment asked for, and it
turned out to matter: probing the live API first is what surfaced the sixteen defects the client then had
to be built around. Every slice merged on its own rather than arriving as one large drop.

### Part 1 — architecture and trade-offs

**One cache, not two.** RTK Query runs over a thin axios `baseQuery`
([`src/helpers/axios/axios-base-query.ts`](src/helpers/axios/axios-base-query.ts)), and its cache _is_ the
message store. Socket events don't feed a parallel store — they patch the same cache through
`upsertCachedMessage` and `applyMessageToInbox` in
[`src/providers/socket-provider.tsx`](src/providers/socket-provider.tsx). Fetched history and live messages
therefore can't disagree, which is the failure mode most real-time chat UIs eventually hit.

**Normalize at the boundary.** REST and the socket describe the same message differently — `_id` versus
`id`, string versus numeric timestamps — and `POST /conversations` doesn't match `GET /conversations` for
the same conversation. [`src/lib/adapters/`](src/lib/adapters/) absorbs all of it, so components only ever
see one `Message` and one `Conversation` type.

**Redux holds only what the server can't.**
[`chat-slice.ts`](src/redux/features/chat/chat-slice.ts) owns the outbox (pending and failed sends, with
retry), unread counts, connection status, and last-active timestamps. Everything else stays server state.

**Presence is inferred, and says so.** The API emits no presence events, so sending a message is the only
proof of life available. [`use-presence.ts`](src/hooks/use-presence.ts) derives a "last active" label from
message timestamps and never claims someone is online — only your own connection status is stated as fact.

**Auth is gated at the edge.** [`src/proxy.ts`](src/proxy.ts) checks the JWT cookie before the chat shell
renders, so there's no flash of a logged-out screen, and `?next=` returns you to where you were.

**Pagination accumulates upward.** [`messages-api.ts`](src/redux/api/messages-api.ts) uses
`serializeQueryArgs` to keep one cache entry per conversation and `merge` to grow it, deduplicating by id
because the API's `before` cursor is inclusive.

**Auto-scroll got the most care**, since it's the requirement most easily got wrong.
[`use-auto-scroll.ts`](src/hooks/use-auto-scroll.ts): an 80px pin threshold, scroll-anchoring so loading
older messages doesn't move the page under you, your own messages always scroll into view, and incoming
messages while you're scrolled up become an unseen counter instead of a jump. `prefers-reduced-motion`
turns the smooth scrolling off.

Trade-offs I made deliberately:

- **RTK Query rather than TanStack Query.** Redux was already earning its place for the outbox, unread
  counts and presence. One library covering both server and client state beat running two.
- **No test suite.** Inside 24 hours the budget went to the chat panel. Verification was the Postman/newman
  run (17 requests, 43 assertions) plus manual testing across four accounts. It's the first thing on the
  list below.
- **No message virtualization.** A 25-message page window keeps the DOM small enough that virtualization
  isn't yet paying for its complexity.

### Part 2 — design reasoning

The palette is called **Signal**, and it runs on rules rather than picks. Blue leads and owns the primary
action and your own message bubble; every hue is pulled to a lower lightness than its source; green is
reserved for presence and never doubles as a call to action; red is destructive-only. The neutrals aren't
gray — the ramp sits at hue 242–252, cool ink under a blue product. The rules come from research on colour
in chat interfaces, not from taste alone.

Contrast was a constraint rather than a final check: every text pair meets WCAG AA 4.5:1, and every control
boundary, focus ring and status dot meets 3:1.

Landing sections reveal as you scroll ([`reveal.tsx`](src/components/landing/reveal.tsx)), with a
`<noscript>` style block so the page is complete without JavaScript, and reduced-motion disables the
movement entirely.

Two additions I'd point at specifically:

- [`scroll-etiquette-demo.tsx`](src/components/landing/scroll-etiquette-demo.tsx) — the landing page
  _demonstrates_ the scroll rule instead of claiming it in a feature bullet. Messages keep arriving; scroll
  up and the view stops chasing you, and a counter appears instead.
- [`support-bot.tsx`](src/components/landing/support-bot.tsx) — the help widget renders through the
  product's own `MessageBubble`, so the thing answering questions about the app is visibly the app. Its
  answers come from a lookup table rather than a model: it can decline a question, but it can't invent one.

### AI tools

I used **Claude Code** throughout, mostly as a fast pair rather than an author.

Where it helped most: driving the live API probes across four fixture accounts and capturing the real
responses, scaffolding the Postman collection, component boilerplate, and debugging. It also drafted prose
that I then cut down — the first drafts of both the API reference and this write-up were noticeably longer
and more promotional than what shipped.

What I didn't take from it: the architecture decisions above are mine, and the parts that needed real care
were written or substantially reworked by hand — the auto-scroll behaviour, the socket-to-cache patching,
and the palette. Generated code that guessed at API behaviour instead of checking it was rejected outright;
everything documented in `docs/api/` was verified against the live API before it went in.

### Issues I ran into with the API

Plenty — sixteen defects are catalogued with reproductions in
[Appendix A of the API reference](docs/api/README.md#appendix-a--known-defects). These six are the ones that
actually changed the client:

| Behaviour                                                                                                                                                               | How I handled it                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/users/search` interpolates `q` into a regex unescaped: `q=.` returns every user, and `+` or `*` return a `500`. **E.164 phone numbers are unsearchable as a result.** | A metacharacter guard in [`use-chat-data.ts`](src/hooks/use-chat-data.ts) blocks the request before it's sent, and the UI sets the expectation that search matches names                         |
| The `before` cursor is **inclusive**, so every page repeats its first message                                                                                           | Deduplicate by id inside the RTK Query `merge`                                                                                                                                                   |
| Empty and whitespace-only message text is persisted                                                                                                                     | The composer disables send on a trimmed value, and `sendMessage` re-checks before dispatching                                                                                                    |
| An unknown conversation id returns `200` with a body of `null`                                                                                                          | `if (!created?._id)` marks the queued message failed and offers a retry, rather than rendering a blank bubble                                                                                    |
| Empty conversations return `lastMessage: {}` on some rows, `null` on others, and omit the key entirely on a new group                                                   | [`conversation.ts`](src/lib/adapters/conversation.ts) keys off a parseable `createdAt` — null-checking the object alone yields an Invalid Date that throws mid-render                            |
| A missing auth header returns `400`, not `401`, and only group creation returns `201`                                                                                   | Branch on non-2xx rather than on `401`. [`api-error.ts`](src/lib/api-error.ts) maps by `error.code`, which the API types as `string \| number`, and never shows a raw server message to the user |

### With more time

Tests first — Playwright against the scroll behaviour, and unit tests on the adapters and `mergeMessages`,
which are pure and the most consequential logic in the app. Then read receipts and typing indicators, both
of which need socket events the API doesn't emit yet. After that: message virtualization past a few hundred
rows, optimistic conversation creation so a new chat opens instantly, and an error boundary with real
reporting behind it.
