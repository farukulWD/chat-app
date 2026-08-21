# Chat App

A real-time 1-to-1 and group chat application built for the Frontend Developer take-home assignment.

**Stack** — Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Socket.io

## Part 1 — API documentation

Documenting the provided API is the first deliverable, and it is complete:

| Deliverable | What it is |
|---|---|
| [`docs/api/README.md`](docs/api/README.md) | Full written reference — every endpoint with request and response schemas, status codes, the error model, Socket.io events, client integration notes, a catalogue of 15 API defects found while probing, and a redesign appendix |
| [`docs/api/Chat.postman_collection.json`](docs/api/Chat.postman_collection.json) | The same contract in executable form — 17 requests across 7 folders, chained so the whole collection runs end to end with no ids pasted by hand, with 44 real captured responses saved as examples |

The API's own Swagger document is deliberately request-only — it specifies no response bodies and no status
codes, and says that documenting them is part of the task. Everything in these two files was established by
exercising the live API against four fixture accounts over both REST and Socket.io.

Verify the collection against the live API at any time:

```bash
npx newman run docs/api/Chat.postman_collection.json --timeout-request 90000
# 17 requests · 43 assertions · 0 failures
```

The API is hosted on Render's free tier and suspends when idle. The first request after a quiet period can
take 30–60 seconds, hence the raised timeout.

## Getting started

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

## Project layout

```
docs/api/        Part 1 API documentation — reference + Postman collection
src/app/         Next.js App Router
```
