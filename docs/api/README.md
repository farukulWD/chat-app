# Chat API Reference

Documentation for the real-time chat API at `https://frontend-task-chatapp.onrender.com`, written as the
standalone deliverable for Part 1 of the Frontend Developer take-home assignment.

The API ships a Swagger document at [`/docs/`](https://frontend-task-chatapp.onrender.com/docs/), but it is
request-only by design. Its own description says so:

> **This spec is intentionally request-focused.** It documents the endpoints, methods, parameters, and request
> bodies — but it does **not** specify response bodies or status codes. Documenting the request/response
> structures in your own way is part of the task.

Every operation there resolves its responses to a single placeholder. So everything below — response shapes,
status codes, the error envelope, pagination semantics, socket payloads, and sixteen concrete defects — was
established by exercising the live API against four fixture accounts, then re-verified with an automated run.

**Companion artifact:** [`Chat.postman_collection.json`](./Chat.postman_collection.json) — the same contract in
executable form, with real captured responses saved on every request. It runs top to bottom with no ids pasted
by hand:

```bash
npx newman run docs/api/Chat.postman_collection.json --timeout-request 90000
# → 17 requests, 43 assertions, 0 failures
```

---

## Contents

- [At a glance](#at-a-glance)
- [Quickstart](#quickstart)
- [Conventions](#conventions)
- [Error model](#error-model)
- [Endpoints](#endpoints)
  - [Health](#get-health)
  - [Auth](#post-authlogin) · [Users](#get-userssearch) · [Conversations](#post-conversations)
  - [Messages](#post-messages) · [Groups](#post-conversationsgroup)
- [WebSocket](#websocket-socketio)
- [Building a client against this API](#building-a-client-against-this-api)
- [Appendix A — Known defects](#appendix-a--known-defects)
- [Appendix B — How I would redesign it](#appendix-b--how-i-would-redesign-it)

---

## At a glance

|                  |                                                                                   |
| ---------------- | --------------------------------------------------------------------------------- |
| **REST base**    | `https://frontend-task-chatapp.onrender.com/api`                                  |
| **Host root**    | `https://frontend-task-chatapp.onrender.com` — serves `/health` **and** Socket.io |
| **Auth**         | `Authorization: Bearer <jwt>` — HS256, 7-day expiry                               |
| **Content type** | `application/json; charset=utf-8` throughout                                      |
| **CORS**         | `Access-Control-Allow-Origin: *`; preflight answers `204`                         |
| **Hosting**      | Render free tier — a cold instance takes **30–60 s** to answer its first request  |

The `/api` prefix is not universal. `/health` and the Socket.io endpoint sit at the host root, and
`GET /api/health` returns `404`. Two separate base URLs are needed.

| Method   | Path                                                                                     | Auth | Purpose                          |
| -------- | ---------------------------------------------------------------------------------------- | :--: | -------------------------------- |
| `GET`    | [`/health`](#get-health) _(root)_                                                        |  –   | Liveness probe                   |
| `POST`   | [`/auth/login`](#post-authlogin)                                                         |  –   | Log in, registering on first use |
| `GET`    | [`/auth/me`](#get-authme)                                                                |  ✅  | Resolve token → user             |
| `GET`    | [`/users/search`](#get-userssearch)                                                      |  ✅  | Find people by name or phone     |
| `POST`   | [`/conversations`](#post-conversations)                                                  |  ✅  | Open a direct conversation       |
| `GET`    | [`/conversations`](#get-conversations)                                                   |  ✅  | The inbox                        |
| `GET`    | [`/conversations/{id}/messages`](#get-conversationsidmessages)                           |  ✅  | Message history, paginated       |
| `POST`   | [`/messages`](#post-messages)                                                            |  ✅  | Send a message                   |
| `POST`   | [`/conversations/group`](#post-conversationsgroup)                                       |  ✅  | Create a group                   |
| `POST`   | [`/conversations/{id}/participants`](#post-conversationsidparticipants)                  |  ✅  | Add members _(admin)_            |
| `DELETE` | [`/conversations/{id}/participants/{userId}`](#delete-conversationsidparticipantsuserid) |  ✅  | Remove a member, or leave        |
| `POST`   | [`/conversations/{id}/admins`](#post-conversationsidadmins)                              |  ✅  | Promote to admin _(admin)_       |
| `PATCH`  | [`/conversations/{id}`](#patch-conversationsid)                                          |  ✅  | Rename a group _(admin)_         |

---

## Quickstart

```bash
ROOT=https://frontend-task-chatapp.onrender.com
BASE=$ROOT/api

# 0. Wake the instance — the free tier sleeps, and the first call can take a minute.
curl -s $ROOT/health
# {"status":"ok"}

# 1. Log in. An unknown phone number registers a new account; there is no separate signup.
TOKEN=$(curl -s -X POST $BASE/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"phone":"+8801712345678","name":"MD FARUKUL ISLAM"}' | jq -r .token)

# 2. Find someone. Prefix-match on the name — see the caveats before trusting this.
curl -s "$BASE/users/search?q=Chat" -H "Authorization: Bearer $TOKEN" | jq '.[0]'

# 3. Open a conversation with them, and send.
CONV=$(curl -s -X POST $BASE/conversations \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"userId":"<their _id>"}' | jq -r ._id)

curl -s -X POST $BASE/messages \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d "{\"conversationId\":\"$CONV\",\"text\":\"Hello\"}"
```

---

## Conventions

**Identifiers** are 24-character hexadecimal MongoDB ObjectIds, returned as `_id`. The one exception is the
`message:new` socket event, which calls the same field `id`.

**Timestamps** are ISO-8601 UTC strings over REST (`2026-08-21T13:48:29.241Z`) and **epoch-millisecond
integers** over Socket.io (`1787320387460`). The same message therefore arrives in two different formats
depending on the path it took.

**Envelopes are inconsistent** — there is no single wrapper to unwrap:

| Endpoint                           | Shape                                    |
| ---------------------------------- | ---------------------------------------- |
| `GET /conversations`               | `{ "data": [ … ] }`                      |
| `GET /conversations/{id}/messages` | `{ "messages": [ … ], "hasMore": bool }` |
| `GET /users/search`                | a bare `[ … ]` array                     |
| everything else                    | the resource object, unwrapped           |

**Population is inconsistent too.** `sender` and `conversation` on a message are always raw id strings;
`participants` is a raw id array on `POST /conversations` but an array of populated `{_id, name, phone}`
objects everywhere else. Resolve users through a client-side cache keyed by id rather than expecting them
inline.

**Cold starts.** Free-tier Render suspends idle instances. The first request after a quiet period can take
30–60 seconds; subsequent ones settle around 300–900 ms. A client needs a request timeout well above the
default and a loading state that survives a minute — this is the single biggest perceived-performance factor
in the whole API.

### Core objects

```jsonc
// User — as returned by /auth/login, /auth/me, /users/search, and inside populated participants
{ "_id": "6a885720e5d6aac97522508d",
  "name": "MD FARUKUL ISLAM",
  "phone": "+8801712345678",
  "createdAt": "2026-08-21T13:48:16.809Z" }   // /auth/* only; omitted in search and participants

// Message — REST shape
{ "_id": "6a88572de5d6aac9752250f7",
  "conversation": "6a88572be5d6aac9752250e6",  // id string, never populated
  "sender": "6a885720e5d6aac97522508d",        // id string, never populated
  "text": "Message one from A",
  "createdAt": "2026-08-21T13:48:29.241Z" }

// Conversation — direct, as it appears in GET /conversations
{ "_id": "…", "type": "direct",
  "lastMessage": { "text": "…", "sender": "…", "createdAt": "…" },  // no _id; null OR {} when empty
  "updatedAt": "…",
  "participant": { "_id": "…", "name": "…", "phone": "…" } }        // singular: the OTHER person

// Conversation — group
{ "_id": "…", "type": "group", "name": "Project Team",
  "lastMessage": { … }, "updatedAt": "…",
  "createdBy": "…",                 // id; may name someone who has since left
  "admins": ["…"],                  // ids, not populated
  "participants": [ { "_id": "…", "name": "…", "phone": "…" } ] }   // includes the caller
```

---

## Error model

Failures share one envelope:

```json
{
  "error": {
    "message": "Not a participant of this conversation",
    "code": "FORBIDDEN"
  }
}
```

Schema validation failures add `details`:

```json
{
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "name", "message": "Required" }]
  }
}
```

| `code`             | Status  | Raised when                                                      |
| ------------------ | :-----: | ---------------------------------------------------------------- |
| `NO_TOKEN`         | **400** | `Authorization` header absent — `401` would be correct           |
| `INVALID_TOKEN`    |   401   | Token malformed, mis-signed, or expired                          |
| `VALIDATION_ERROR` |   400   | Body failed validation; `details[]` names the fields             |
| `FORBIDDEN`        |   403   | Not a participant, or not an admin                               |
| `NOT_FOUND`        |   404   | No such conversation — also the catch-all for unrouted paths     |
| `NOT_A_GROUP`      |   400   | Group operation aimed at a direct conversation                   |
| `NOT_A_MEMBER`     |   400   | Promotion target is not in the group                             |
| `UNKNOWN_USER`     |   400   | Referenced user does not exist                                   |
| `SERVER_ERROR`     |   500   | Unhandled — in practice a malformed ObjectId reaching the driver |

Two responses escape the envelope's own conventions:

```jsonc
// A malformed id leaks the raw Mongoose cast error as a 500
{ "error": { "message": "Cast to ObjectId failed for value \"abc\" (type string) at path \"_id\" for model \"Conversation\"",
             "code": "SERVER_ERROR" } }

// A bad search regex returns a NUMERIC code straight from MongoDB
{ "error": { "message": "Regular expression is invalid: quantifier does not follow a repeatable item",
             "code": 51091 } }
```

So `error.code` is `string | number`. Never render `error.message` directly to a user — map `error.code` to
your own copy, and fall back to a generic message for anything unrecognized.

**Unrouted paths and unsupported methods** both return `404 { "error": { "message": "Route not found", "code":
"NOT_FOUND" } }`. There is no `405`.

---

## Endpoints

### `GET /health`

Liveness probe. **Served from the host root, not from `/api`** — the Swagger document places it under `/api`,
but `GET /api/health` returns `404`.

<details open><summary><b>Response</b> · <code>200 OK</code></summary>

```json
{ "status": "ok" }
```

</details>

```bash
curl -s https://frontend-task-chatapp.onrender.com/health
```

Worth calling on app start purely to absorb the cold-start delay before the user reaches the login form.

---

### `POST /auth/login`

Log in **or** register — one call for both. An unknown phone number creates an account; a known one
authenticates it. There is no separate signup endpoint.

**Auth:** none.

| Field   | Type   | Required | Notes                                                      |
| ------- | ------ | :------: | ---------------------------------------------------------- |
| `phone` | string |    ✅    | Not validated in any way — see below                       |
| `name`  | string |    ✅    | On an existing account this **overwrites** the stored name |

<details open><summary><b>Response</b> · <code>200 OK</code></summary>

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
  "user": {
    "_id": "6a885720e5d6aac97522508d",
    "name": "MD FARUKUL ISLAM",
    "phone": "+8801712345678",
    "createdAt": "2026-08-21T13:48:16.809Z"
  }
}
```

</details>

The token is HS256 with payload `{ sub, iat, exp }` and a **7-day** lifetime. Nothing signals expiry other
than a `401` on the next call, so treat any `401` as "session over, log in again".

| Status | Case                                           |
| :----: | ---------------------------------------------- |
| `200`  | Logged in or registered                        |
| `400`  | `VALIDATION_ERROR` — `phone` or `name` missing |

**Caveats**

- **Phone format is never checked.** `{"phone":"abc","name":"X"}` returns `200` and creates a real account.
  All format validation belongs to the client.
- **Re-login renames the account.** Logging in with the same phone and a different `name` silently updates it,
  and the new name propagates to every conversation the user appears in. A "name" field on the login form is
  effectively a rename control for returning users.
- Re-login always mints a fresh token; previously issued ones stay valid until they expire.

```bash
curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' \
  -d '{"phone":"+8801712345678","name":"MD FARUKUL ISLAM"}'
```

---

### `GET /auth/me`

Resolve the bearer token to its user. The session-restore call: run it on app start against a persisted token
and route to the login screen if it fails.

**Auth:** required.

<details open><summary><b>Response</b> · <code>200 OK</code></summary>

```json
{
  "_id": "6a885720e5d6aac97522508d",
  "name": "MD FARUKUL ISLAM",
  "phone": "+8801712345678",
  "createdAt": "2026-08-21T13:48:16.809Z"
}
```

</details>

| Status | Case                                                |
| :----: | --------------------------------------------------- |
| `200`  | Token valid                                         |
| `400`  | `NO_TOKEN` — header absent                          |
| `401`  | `INVALID_TOKEN` — malformed, mis-signed, or expired |

Note the split: a _missing_ header is `400`, an _invalid_ token is `401`. Branching on "not 2xx" handles both.

```bash
curl -s $BASE/auth/me -H "Authorization: Bearer $TOKEN"
```

---

### `GET /users/search`

Find users to start a conversation with. Returns a **bare array** — the only endpoint that does not wrap its
payload.

**Auth:** required.

| Param | In    |           Required            | Notes                                                      |
| ----- | ----- | :---------------------------: | ---------------------------------------------------------- |
| `q`   | query | declared ✅, **not enforced** | Case-sensitive prefix on `name`, or exact match on `phone` |

<details open><summary><b>Response</b> · <code>200 OK</code></summary>

```json
[
  {
    "_id": "6a885722e5d6aac97522509b",
    "name": "Chat Test Bravo",
    "phone": "+8801712345679"
  },
  {
    "_id": "6a885722e5d6aac9752250a5",
    "name": "Chat Test Charlie",
    "phone": "+8801712345680"
  }
]
```

</details>

**Matching rules**, established by probing:

| `q`              |        Result        | Rule                                        |
| ---------------- | :------------------: | ------------------------------------------- |
| `Chat`           | ✅ `Chat Test Bravo` | `name` is matched as an anchored **prefix** |
| `hat`            |          ❌          | substring search is not supported           |
| `chat`           |          ❌          | the match is **case-sensitive**             |
| `01672589498`    |   ✅ that account    | `phone` needs the **complete** number       |
| `0167`           |          ❌          | `phone` is not prefix-matched               |
| `+8801712345679` |       💥 `500`       | see below                                   |

**Defects to design around**

1. **`q` is required but unenforced.** Omitting it, or sending `q=`, returns the **entire user table** —
   several hundred accounts on the shared instance. Guard client-side; never fire the request on an empty box.
2. **The term is interpolated into a regular expression unescaped.** `q=.` matches everyone. Any
   metacharacter that cannot legally open a pattern returns `500` — including `+`, which means **no phone
   number stored in E.164 format is searchable at all**. Percent-encoding does not help: the server receives
   the decoded `+`. Since most accounts store `+`-prefixed numbers, phone lookup is effectively unusable and
   name search is the only dependable path.
3. **The caller appears in their own results.** Filter your own `_id` out before rendering.
4. **Names are not unique** — several distinct accounts share one. Always show the phone number alongside the
   name so the user can tell them apart.

| Status | Case                                                  |
| :----: | ----------------------------------------------------- |
| `200`  | Matches, or `[]`                                      |
| `400`  | `NO_TOKEN`                                            |
| `401`  | `INVALID_TOKEN`                                       |
| `500`  | `q` contains a regex metacharacter such as `+` or `*` |

```bash
curl -s "$BASE/users/search?q=Chat" -H "Authorization: Bearer $TOKEN"
```

---

### `POST /conversations`

Open a 1-to-1 conversation, or return the existing one. **Idempotent** — calling it twice with the same
`userId` returns the identical `_id`, so it is safe to call every time a user is picked from search rather
than tracking whether a conversation already exists.

**Auth:** required.

| Field    | Type   | Required | Notes                                       |
| -------- | ------ | :------: | ------------------------------------------- |
| `userId` | string |    ✅    | The other participant, from `/users/search` |

<details open><summary><b>Response</b> · <code>200 OK</code> — never <code>201</code></summary>

```json
{
  "_id": "6a88572be5d6aac9752250e6",
  "participants": ["6a885720e5d6aac97522508d", "6a885722e5d6aac97522509b"],
  "createdAt": "2026-08-21T13:48:27.122Z"
}
```

</details>

⚠️ **This shape does not match the one in `GET /conversations`.** Here `participants` is an array of raw id
strings and there is no `type`; there, the same conversation carries `type: "direct"` and a populated
`participant` object. Take the `_id` from this response and refetch the list, or merge optimistically and
reconcile — do not feed one shape to the other's parser.

⚠️ **Passing your own `userId` does not error.** The lookup matches "conversations containing both ids", and
with both ids equal it matches an arbitrary conversation of yours and returns it. Block self-selection in the
UI.

No socket event fires on creation, so the other participant will not see the conversation until a message
arrives.

| Status | Case                                                                  |
| :----: | --------------------------------------------------------------------- |
| `200`  | Created, or already existed                                           |
| `400`  | `VALIDATION_ERROR` (`userId` missing) · `UNKNOWN_USER` (no such user) |
| `500`  | `userId` is not a valid ObjectId                                      |

```bash
curl -s -X POST $BASE/conversations -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"userId":"6a885722e5d6aac97522509b"}'
```

---

### `GET /conversations`

The inbox: every conversation the caller belongs to, direct and group, sorted by `updatedAt` **descending** —
render order, no client sorting needed.

**Auth:** required. No parameters. The `q` filter that appears in some drafts of this API is not implemented;
the server ignores it.

<details open><summary><b>Response</b> · <code>200 OK</code></summary>

```json
{
  "data": [
    {
      "_id": "6a88572be5d6aac9752250e6",
      "type": "direct",
      "lastMessage": {
        "text": "Message four from A",
        "sender": "6a885720e5d6aac97522508d",
        "createdAt": "2026-08-21T13:48:33.071Z"
      },
      "updatedAt": "2026-08-21T13:48:33.305Z",
      "participant": {
        "_id": "6a885722e5d6aac97522509b",
        "name": "Chat Test Bravo",
        "phone": "+8801712345679"
      }
    },

    {
      "_id": "6a885735e5d6aac97522515a",
      "type": "group",
      "lastMessage": { "text": "Hello group", "sender": "…", "createdAt": "…" },
      "updatedAt": "2026-08-21T13:48:45.815Z",
      "name": "API Docs Probe Group",
      "createdBy": "6a885720e5d6aac97522508d",
      "admins": ["6a885720e5d6aac97522508d", "6a885722e5d6aac97522509b"],
      "participants": [{ "_id": "…", "name": "…", "phone": "…" }]
    }
  ]
}
```

</details>

Both variants share `_id`, `type`, `updatedAt`, `lastMessage`, then diverge:

- **`direct`** adds `participant` — a single populated object for _the other person_, already resolved, so
  there is no "which one is not me" step.
- **`group`** adds `name`, `createdBy`, `admins` (ids) and `participants` (populated, **including the
  caller**). Cross-reference `admins` against `participants` to mark who is an admin.

`lastMessage` is a projection of `{ text, sender, createdAt }` with **no `_id`**, so it cannot be
deduplicated by id against the message list.

⚠️ **An empty conversation is not consistently `null`.** Most rows with no messages return
`"lastMessage": null`, but some return `"lastMessage": {}` — an empty object with no `text`, no
`sender` and no `createdAt`. Both mean the same thing. A client that only null-checks reaches
`new Date(undefined)`, gets an Invalid Date, and throws the moment anything formats it. Treat a
missing `createdAt` as "no last message", not as a timestamp.

There is **no unread count and no pagination** on this endpoint.

|    Status     | Case                             |
| :-----------: | -------------------------------- |
|     `200`     | Always, `{"data":[]}` when empty |
| `400` / `401` | Auth                             |

```bash
curl -s $BASE/conversations -H "Authorization: Bearer $TOKEN"
```

---

### `GET /conversations/{id}/messages`

Message history, newest first, with cursor pagination for loading older messages.

**Auth:** required — and this endpoint doubles as the access check: a non-participant gets `403`.

| Param    | In    | Required | Notes                                                       |
| -------- | ----- | :------: | ----------------------------------------------------------- |
| `id`     | path  |    ✅    | Conversation id — direct or group                           |
| `limit`  | query |    –     | Page size. **Advisory only** — see below                    |
| `before` | query |    –     | Cursor: `_id` of the oldest message you hold. **Inclusive** |

<details open><summary><b>Response</b> · <code>200 OK</code></summary>

```json
{
  "messages": [
    {
      "_id": "6a885731e5d6aac975225122",
      "conversation": "6a88572be5d6aac9752250e6",
      "sender": "6a885720e5d6aac97522508d",
      "text": "Message four from A",
      "createdAt": "2026-08-21T13:48:33.071Z"
    },
    {
      "_id": "6a88572fe5d6aac975225111",
      "conversation": "6a88572be5d6aac9752250e6",
      "sender": "6a885720e5d6aac97522508d",
      "text": "Message three from A",
      "createdAt": "2026-08-21T13:48:31.783Z"
    }
  ],
  "hasMore": true
}
```

</details>

**Ordering is newest-first.** Reverse the array before rendering a transcript.

#### Three pagination defects

**1. `limit` is ignored unless it is a positive number.** `limit=0`, `limit=-5`, `limit=abc` and
`limit=100000` all return the _complete_ history. There is no server-side cap, so a long conversation can
return unboundedly. Always send a sane positive `limit` and never assume the server enforced it.

**2. `before` is inclusive.** The cursor message comes back as the first element of the next page. Verified at
every page boundary:

```
GET …/messages?limit=2                    → [ msg4, msg3 ]   hasMore true
GET …/messages?limit=2&before=msg3        → [ msg3, msg2 ]   hasMore true     ← msg3 repeats
GET …/messages?limit=2&before=msg2        → [ msg2, msg1 ]   hasMore true     ← msg2 repeats
GET …/messages?limit=2&before=msg1        → [ msg1 ]         hasMore false
```

Deduplicate by `_id` when merging pages, or drop `messages[0]`. Without that, one message renders twice per
page — and each page yields `limit - 1` genuinely new messages, not `limit`.

**3. `hasMore` overshoots by one page.** On the last page that still contains unseen data it reports `true`;
only the follow-up request — which returns the cursor message alone — reports `false`. Trusting it costs
exactly one wasted round trip at the top of every conversation. The reliable end-of-history signal is
**`messages.length <= 1`** once the echoed cursor is removed.

An unknown-but-well-formed `before` is silently ignored and the newest page is returned. A malformed one
returns `500`.

| Status | Case                                     |
| :----: | ---------------------------------------- |
| `200`  | History returned                         |
| `403`  | `FORBIDDEN` — not a participant          |
| `404`  | `NOT_FOUND` — no such conversation       |
| `500`  | `id` or `before` is not a valid ObjectId |

```bash
curl -s "$BASE/conversations/$CONV/messages?limit=20" -H "Authorization: Bearer $TOKEN"
curl -s "$BASE/conversations/$CONV/messages?limit=20&before=$OLDEST_ID" -H "Authorization: Bearer $TOKEN"
```

---

### `POST /messages`

Send a message to a direct or group conversation — the conversation id decides which. The server fans it out
to the other participants as a `message:new` socket event.

**Auth:** required.

| Field            | Type   | Required | Notes                                       |
| ---------------- | ------ | :------: | ------------------------------------------- |
| `conversationId` | string |    ✅    | Direct or group                             |
| `text`           | string |    ✅    | Must be _present_; may be empty — see below |

<details open><summary><b>Response</b> · <code>200 OK</code> — not <code>201</code></summary>

```json
{
  "_id": "6a88572de5d6aac9752250f7",
  "conversation": "6a88572be5d6aac9752250e6",
  "sender": "6a885720e5d6aac97522508d",
  "text": "Message one from A",
  "createdAt": "2026-08-21T13:48:29.241Z"
}
```

</details>

⚠️ **Empty text is accepted.** Both `""` and `"   "` return `200`, are persisted, and then occupy the
`lastMessage` slot in the inbox. The assignment requires that empty messages not be sendable, so **that rule
is entirely the client's** — trim and reject before calling. Omitting `text` altogether _is_ rejected with
`400 VALIDATION_ERROR`.

⚠️ **An unknown-but-well-formed `conversationId` returns `200` with a body of `null`.** Not `404`. Check for a
null body before dereferencing the response.

⚠️ **The socket copy of this message has a different shape** — `id` instead of `_id`, and `createdAt` as an
epoch-millisecond number. See [WebSocket](#websocket-socketio).

Message length is unbounded; a 5 000-character body was accepted unchanged.

| Status | Case                                                    |
| :----: | ------------------------------------------------------- |
| `200`  | Sent — **or** `null` body for an unknown conversation   |
| `400`  | `VALIDATION_ERROR` — `text` or `conversationId` missing |
| `403`  | `FORBIDDEN` — not a participant                         |
| `500`  | `conversationId` is not a valid ObjectId                |

```bash
curl -s -X POST $BASE/messages -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{\"conversationId\":\"$CONV\",\"text\":\"Hello\"}"
```

---

### `POST /conversations/group`

Create a group conversation. The caller is added automatically and becomes the sole admin — do **not** include
your own id in `participantIds`.

**Auth:** required.

| Field            | Type     | Required | Notes                                                    |
| ---------------- | -------- | :------: | -------------------------------------------------------- |
| `name`           | string   |    ✅    | Group name                                               |
| `participantIds` | string[] |    ✅    | **At least two** other users — three total including you |

<details open><summary><b>Response</b> · <code>201 Created</code></summary>

```json
{
  "_id": "6a885735e5d6aac97522515a",
  "type": "group",
  "name": "API Docs Probe Group",
  "createdBy": "6a885720e5d6aac97522508d",
  "admins": ["6a885720e5d6aac97522508d"],
  "participants": [
    {
      "_id": "6a885720e5d6aac97522508d",
      "name": "MD FARUKUL ISLAM",
      "phone": "+8801712345678"
    },
    {
      "_id": "6a885722e5d6aac97522509b",
      "name": "Chat Test Bravo",
      "phone": "+8801712345679"
    },
    {
      "_id": "6a885722e5d6aac9752250a5",
      "name": "Chat Test Charlie",
      "phone": "+8801712345680"
    }
  ],
  "createdAt": "2026-08-21T13:48:37.366Z",
  "updatedAt": "2026-08-21T13:48:37.366Z"
}
```

</details>

The **only** endpoint in the API that correctly returns `201`.

Broadcasts `conversation:updated` to every member, the creator included.

| Status | Case                                                                                         |
| :----: | -------------------------------------------------------------------------------------------- |
| `201`  | Created                                                                                      |
| `400`  | `VALIDATION_ERROR` — `name` missing, or `participantIds: "a group needs at least 3 members"` |

```bash
curl -s -X POST $BASE/conversations/group -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Project Team","participantIds":["<id1>","<id2>"]}'
```

---

### `POST /conversations/{id}/participants`

Add one or more members to a group. **Admins only.**

| Field     | Type     | Required |
| --------- | -------- | :------: |
| `userIds` | string[] |    ✅    |

Returns the full group with the enlarged `participants` array and broadcasts `conversation:updated`. Adding an
existing member is a no-op, not an error.

| Status | Case                                               |
| :----: | -------------------------------------------------- |
| `200`  | Added                                              |
| `403`  | `FORBIDDEN` — `"Only admins can add participants"` |

```bash
curl -s -X POST $BASE/conversations/$GROUP/participants -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"userIds":["<id>"]}'
```

---

### `DELETE /conversations/{id}/participants/{userId}`

**One route, two actions**, distinguished only by whose id is in the path:

| `userId`     | Action          | Who may    |
| ------------ | --------------- | ---------- |
| someone else | Remove a member | admins     |
| your own     | Leave the group | any member |

Returns the full group as it now stands and broadcasts `conversation:updated` — the caller receives it too,
even after leaving.

⚠️ **The three-member minimum applies only at creation.** Members can be removed until one person remains, and
`createdBy` may name someone who has left. If the last admin leaves, the group keeps its members but has **no
admin** — and since promotion requires an admin, it can never regain one. Render that state rather than
assuming an admin always exists.

| Status | Case                                              |
| :----: | ------------------------------------------------- |
| `200`  | Removed, or left                                  |
| `403`  | `FORBIDDEN` — not an admin, removing someone else |

```bash
curl -s -X DELETE $BASE/conversations/$GROUP/participants/$USER -H "Authorization: Bearer $TOKEN"
```

---

### `POST /conversations/{id}/admins`

Promote an existing member to admin. **Admins only.**

| Field    | Type   | Required |
| -------- | ------ | :------: |
| `userId` | string |    ✅    |

Admin rights are **additive only** — there is no demote endpoint and no way to revoke them short of removing
the user from the group.

| Status | Case                                                    |
| :----: | ------------------------------------------------------- |
| `200`  | Promoted                                                |
| `400`  | `NOT_A_MEMBER` — target is not in the group (not `404`) |
| `403`  | `FORBIDDEN` — caller is not an admin                    |

```bash
curl -s -X POST $BASE/conversations/$GROUP/admins -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"userId":"<id>"}'
```

---

### `PATCH /conversations/{id}`

Rename a group. **Admins only.**

| Field  | Type   | Required |
| ------ | ------ | :------: |
| `name` | string |    ✅    |

The only `PATCH` in the API. The route carries no `/group` segment, which makes it read like a general
conversation update — it is not. Aimed at a direct conversation it returns `400 NOT_A_GROUP`.

| Status | Case                                 |
| :----: | ------------------------------------ |
| `200`  | Renamed                              |
| `400`  | `NOT_A_GROUP` · `VALIDATION_ERROR`   |
| `403`  | `FORBIDDEN` — caller is not an admin |

```bash
curl -s -X PATCH $BASE/conversations/$GROUP -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' -d '{"name":"Renamed Team"}'
```

---

## WebSocket (Socket.io)

Socket.io is served from the **host root**, not from `/api`. Pointing a client at `/api` fails the handshake.

```js
import { io } from "socket.io-client";

const socket = io("https://frontend-task-chatapp.onrender.com", {
  auth: { token }, // the same JWT used for REST
});
```

The token is verified during the handshake. A missing or invalid one is refused and surfaces as
`connect_error`:

```js
socket.on("connect_error", (err) => {
  // err.message === "No token provided" | "Invalid token"
});
```

Because the token lasts 7 days while a socket may live much longer, `connect_error: "Invalid token"` on a
reconnect is the practical expiry signal — treat it as a logout, not a retry.

### `message:send` — client → server

```js
socket.emit("message:send", { conversationId, text }, (ack) => {
  // { ok: true }
  // { ok: false, error: "Conversation not found" }
});
```

**The ack does not return the created message** — only `{ ok: true }`. A client that sends over the socket
therefore has no server id, no `createdAt`, and no way to reconcile an optimistic bubble without refetching
the history.

`POST /messages` returns the persisted message directly, which makes reconciliation trivial. **Recommended
split: send over REST, receive over the socket.** The socket path exists and works, but costs you the
identity of your own message.

Empty text is accepted here exactly as it is over REST.

### `message:new` — server → client

```json
{
  "id": "6a885843e5d6aac975225941",
  "conversation": "6a88572be5d6aac9752250e6",
  "sender": "6a885722e5d6aac97522509b",
  "text": "socket hello from B",
  "createdAt": 1787320387460
}
```

Fires for direct and group conversations alike, whichever path created the message.

Two differences from the REST message shape, both of which will silently break a shared parser:

|            | REST            | `message:new`       |
| ---------- | --------------- | ------------------- |
| identifier | `_id`           | **`id`**            |
| timestamp  | ISO-8601 string | **epoch-ms number** |

**The sender does not receive an echo of their own message.** Only the _other_ participants get
`message:new` — confirmed in both directions and over both send paths. The sending client must append its own
message locally; there is no server round-trip to wait for.

### `conversation:updated` — server → client

Fires when a group is **created, renamed, or has its members or admins changed**. Delivered once per change to
every current member, the actor included.

It does **not** fire for new messages, and it does **not** fire when a direct conversation is created.

The payload is the group object _without_ `createdAt` / `updatedAt`; otherwise identical to the REST group
response, so it can be swapped straight into cached state:

```json
{
  "_id": "…",
  "type": "group",
  "name": "Socket Probe Group v2",
  "createdBy": "…",
  "admins": ["…", "…"],
  "participants": [{ "_id": "…", "name": "…", "phone": "…" }]
}
```

### Event coverage

| Change                          | Event                  | Reaches                                           |
| ------------------------------- | ---------------------- | ------------------------------------------------- |
| Message sent (REST or socket)   | `message:new`          | every participant **except the sender**           |
| Group created / renamed         | `conversation:updated` | all members, actor included                       |
| Member added / removed / left   | `conversation:updated` | all members, actor included                       |
| Member promoted to admin        | `conversation:updated` | all members, actor included                       |
| **Direct conversation created** | _(nothing)_            | — the peer sees it only once a message arrives    |
| **Message sent in a group**     | `message:new` only     | `updatedAt` changes but no `conversation:updated` |

The last two rows are the gaps a client has to paper over: refetch the inbox after starting a direct
conversation, and reorder the inbox locally from `message:new` rather than waiting for a conversation event.

---

## Building a client against this API

The defects above translate into a handful of concrete rules.

**Normalize at the boundary.** REST and socket disagree on `_id`/`id` and on the timestamp type. Convert both
into one internal `Message` type at the point of entry, and let nothing downstream know the difference.

```ts
type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: Date;
};

const fromRest = (m: any): Message => ({
  id: m._id,
  conversationId: m.conversation,
  senderId: m.sender,
  text: m.text,
  sentAt: new Date(m.createdAt),
});

const fromSocket = (m: any): Message => ({
  id: m.id,
  conversationId: m.conversation,
  senderId: m.sender,
  text: m.text,
  sentAt: new Date(m.createdAt), // number → Date works too
});
```

**Send over REST, receive over the socket.** `POST /messages` hands back the persisted message so an
optimistic bubble can be reconciled by id; the socket ack does not. The sender gets no `message:new` echo
anyway, so nothing is lost.

**Deduplicate every merge by message id.** Required by the inclusive `before` cursor, and it also absorbs the
race between a REST response and its socket broadcast.

**Use `messages.length <= 1`, not `hasMore`, as the end-of-history signal** once the echoed cursor is
stripped.

**Enforce the empty-message rule client-side.** Trim, and disable the send control on an empty result. The
server will happily store `"   "`.

**Guard search.** Never fire on an empty box — that returns the entire user table. Never send a raw `+`, which
returns `500`. Filter the caller out of the results, and show phone numbers because names collide.

**Resolve users from a cache, not from the payload.** `sender` is only ever an id. Seed a `Map<id, User>` from
`GET /conversations` — `participant` for direct chats, `participants` for groups — and look senders up there.

**Set generous timeouts and a real cold-start state.** The first request can take a minute on Render's free
tier.

**Treat every non-2xx from `/auth/me` as logged-out**, since a missing header is `400` and an expired token is
`401`.

---

## Appendix A — Known defects

Every item below was observed on the live API and is reproducible from the Postman collection's saved
examples.

|  #  | Area                  | Behaviour                                                                                                    | Client impact                                                           |
| :-: | --------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
|  1  | `/users/search`       | `q` interpolated into a regex unescaped: `q=.` returns everyone; `+` and `*` return `500`                    | **E.164 phone numbers are unsearchable.** Name search only              |
|  2  | `/users/search`       | `q` declared required but unenforced; omitting it returns the whole user table                               | Guard client-side                                                       |
|  3  | `/users/search`       | Case-sensitive prefix on name, exact match on phone                                                          | Search feels broken to users; set expectations in the UI                |
|  4  | `/users/search`       | Caller appears in their own results                                                                          | Filter own id                                                           |
|  5  | Message history       | `before` is **inclusive** — the cursor repeats at the head of each page                                      | Deduplicate by id, or lose a message to a double render                 |
|  6  | Message history       | `hasMore` stays `true` one page past the end                                                                 | One wasted request per conversation                                     |
|  7  | Message history       | `limit` ignored when non-positive or non-numeric; no server cap                                              | Send a valid limit; never assume it was honoured                        |
|  8  | `POST /messages`      | Empty and whitespace-only text is persisted                                                                  | Client must enforce the assignment's rule                               |
|  9  | `POST /messages`      | Unknown-but-valid conversation id → `200` with body `null`                                                   | Null-check before dereferencing                                         |
| 10  | `POST /conversations` | Passing your own id returns an unrelated existing conversation                                               | Block self-selection                                                    |
| 11  | Status codes          | Only group creation returns `201`; a missing auth header returns `400`, not `401`                            | Branch on non-2xx, not on `401` alone                                   |
| 12  | Shapes                | `POST /conversations` ≠ `GET /conversations` for the same conversation; REST ≠ socket for the same message   | Normalize at the boundary                                               |
| 13  | Errors                | A malformed ObjectId surfaces the raw Mongoose cast error as `500`; a bad regex returns a **numeric** `code` | `error.code` is `string \| number`; never show `error.message` to users |
| 14  | Groups                | Three-member minimum enforced only at creation; a group can end up with no admin and no way to appoint one   | Render the admin-less state                                             |
| 15  | `/health`             | Documented under `/api`, served only from the host root                                                      | Two base URLs                                                           |
| 16  | `GET /conversations`  | An empty conversation returns `lastMessage: {}` on some rows and `null` on others                            | Null-checking alone yields an Invalid Date; key off `createdAt`         |

---

## Appendix B — How I would redesign it

The assignment explicitly invites renaming or reshaping endpoints. Documenting the API as it actually behaves
was the priority, since the Part 1 client has to consume the real thing — but these are the changes I would
make with a free hand, in rough order of value.

**Fix the correctness bugs first.** Escape the search term before it reaches the regex (defects 1 and 2 are a
`500` and a full-table dump from the same line of code). Make `before` exclusive. Compute `hasMore` from the
same query that builds the page. Reject empty `text`. Return `404` instead of `200 null`. Serialize an absent
`lastMessage` as `null` on every row, never as `{}`.

**One envelope, everywhere.** `{ "data": … }` for success and `{ "error": { code, message, details? } }` for
failure, on every route including `/users/search`. `error.code` always a string.

**Honest status codes.** `201` on every create, `401` for a missing token, `404` for a missing resource, `400`
reserved for genuine validation failures, and no `500` reachable from user input.

**One conversation representation.** A single serializer, so `POST /conversations`, `GET /conversations`, and
`conversation:updated` all describe a conversation identically — with `participants` populated in all three.
Likewise one message serializer shared by REST and the socket, ending the `_id`/`id` and
string/number-timestamp split.

**Routes that say what they do.** `PATCH /conversations/{id}` becomes `PATCH /groups/{id}`;
`DELETE /conversations/{id}/participants/{userId}` splits into `DELETE /groups/{id}/members/{userId}`
(admin removes) and `POST /groups/{id}/leave` (self), so authorization is not inferred from comparing an id in
a path to the caller. Add `DELETE /groups/{id}/admins/{userId}` to demote, and transfer admin automatically
when the last one leaves.

**Fill the read gaps.** `GET /conversations/{id}` for a single conversation, cursor pagination and an unread
count on the inbox, and `GET /users/{id}` so a sender id can be resolved without holding the whole
conversation.

**Make search usable.** Case-insensitive substring on name, normalized-suffix match on phone (so
`1712345678` finds `+8801712345678`), the caller excluded server-side, and a `limit` with a real cap.

**Close the real-time gaps.** Emit `conversation:created` when a direct conversation opens, echo `message:new`
to the sender so one code path handles all incoming messages, and return the persisted message in the
`message:send` ack. Add `message:read` and `typing` — the two events a chat UI is expected to have.
