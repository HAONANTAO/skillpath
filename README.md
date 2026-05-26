# SkillPath

An adaptive AI learning-path generator. Tell it what you want to learn, and a
LangGraph agent designs a week-by-week roadmap, fetches real resources, generates
quizzes, evaluates your answers, and adapts to your weak spots — both within a
path (retry with focused review) and across paths (Pinecone-backed long-term
memory feeds back into the planner).

> **Live demo:** https://skillpath-blond.vercel.app
>
> First request might take ~30s — Render's free tier cold-starts the backend.

## Why it's interesting

Most "AI learning path" projects stop at "ask an LLM to outline weeks 1–N."
SkillPath does three things that go further:

1. **Memory that actually shapes new content.** Every wrong quiz answer is
   embedded into Pinecone with the concept tag the LLM assigned to that question.
   The next time you generate a roadmap (even on a different topic), the Planner
   sees your historical weak concepts and adjusts which weeks get reinforced.
2. **An adaptive retry loop.** Fail a week's quiz and the app doesn't just say
   "try again." A `retryGraph` runs in parallel: the Researcher fetches
   review-style resources for your specific wrong concepts, and the Quiz agent
   regenerates a focused test that approaches those concepts from new angles.
3. **Real LangGraph orchestration.** `plannerGraph`, `quizGraph`, and
   `retryGraph` are compiled `StateGraph` instances with a shared
   `SkillPathState`. Streaming endpoints surface per-node progress to the UI in
   real time.

## Architecture

```
┌─────────────────┐         ┌─────────────────────────────────────────┐
│  React (Vite)   │ ──────► │  Express + LangGraph agents             │
│  client/        │  HTTP / │  server/                                │
│                 │   SSE   │                                         │
│  · Dashboard    │ ◄────── │  /api/auth          JWT + Google OAuth  │
│  · My paths     │         │  /api/roadmap/*     paths + nodes       │
│  · Weak concepts│         │                                         │
│  · Profile      │         │  Agents:                                │
│  · Roadmap gen  │         │   plannerGraph:  memory → planner       │
│  · Learn node   │         │   quizGraph:     memory → quiz          │
│  · Quiz         │         │   retryGraph:    researcher ∥ quiz      │
└─────────────────┘         │   evaluatorNode  (direct call)          │
                            └────────────┬────────────────────────────┘
                                         │
                ┌───────────┬────────────┼────────────┬───────────┐
                ▼           ▼            ▼            ▼           ▼
          ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
          │ MongoDB  │ │  OpenAI  │ │  Tavily  │ │ Pinecone │ │  Resend  │
          │ (paths,  │ │ (gpt-4o, │ │  (web    │ │ (weak-   │ │  (reset  │
          │  users)  │ │ gpt-4o-  │ │  search) │ │  concept │ │   email) │
          │          │ │ mini,    │ │          │ │  memory) │ │          │
          │          │ │ embeds)  │ │          │ │          │ │          │
          └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘
```

## Tech stack

**Frontend**
- React 19 + Vite + React Router 7
- `@react-oauth/google` for Google sign-in (implicit OAuth flow)
- Tailwind 4 (via `@tailwindcss/vite`)
- Plain CSS for the design system — no UI library, all components hand-rolled
- Shared `AppShell` provides sidebar + topbar + mobile drawer for every
  authenticated page

**Backend**
- Express 4
- `@langchain/langgraph` 1.x for agent orchestration
- `@langchain/openai` for the chat models with structured (Zod) output
- `google-auth-library` to verify Google access tokens server-side
- `resend` for transactional email (password reset)
- Mongoose for MongoDB
- JWT auth (`bcryptjs` + `jsonwebtoken`)
- Server-Sent Events for streaming Planner progress
- vitest for unit tests (evaluator, memory service)

**External services**
- OpenAI (gpt-4o for planner, gpt-4o-mini for quiz, text-embedding-3-small)
- Tavily (web search for learning resources)
- Pinecone (vector store for weak-concept memory; serverless, cosine)
- Google OAuth (sign-in)
- Resend (transactional email)
- MongoDB Atlas

## Setup

You'll need accounts on OpenAI, Tavily, Pinecone, MongoDB Atlas, Google Cloud
(for OAuth client), and Resend. Free tiers work for all of them.

```bash
git clone <this repo>
cd skillpath

# Install root + client + server
npm install
npm install --prefix client
npm install --prefix server

# Configure server env
cp server/.env.example server/.env
# fill in the keys — see below
```

### Environment variables (`server/.env`)

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pw>@cluster.mongodb.net/skillpath?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d

# Where the frontend lives — used for CORS and for building password-reset links
CLIENT_ORIGIN=http://localhost:5173
APP_URL=http://localhost:5173

# Model + data providers
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
PINECONE_API_KEY=pcsk-...

# Google OAuth — Web application client ID from console.cloud.google.com
GOOGLE_CLIENT_ID=xxx-yyy.apps.googleusercontent.com

# Transactional email — resend.com/api-keys
RESEND_API_KEY=re_...
# Sandbox sender is fine for demos; verify a domain in Resend before sending
# password resets to arbitrary users in production.
EMAIL_FROM=SkillPath <onboarding@resend.dev>
```

Frontend reads the Google client ID from `client/src/config.js` (or the
`VITE_GOOGLE_CLIENT_ID` env override). It's a public value so checking it
into source is fine.

### One-time external setup

- **MongoDB Atlas → Network Access**: add your dev IP (or `0.0.0.0/0` for
  serverless backends like Render).
- **Pinecone**: nothing to do — the index `skillpath-memory` is auto-created
  on first write.
- **Google Cloud → APIs & Services → Credentials → OAuth client (Web)**:
  add `http://localhost:5173` and your production URL to *Authorized
  JavaScript origins*. Under *OAuth consent screen → Audience*, add yourself
  as a Test user while the project is in "Testing" mode.
- **Resend → API keys**: create a key with Full access. Sandbox mode can
  only send to the email you registered with — verify a domain at
  `resend.com/domains` to send to anyone.

### Run

```bash
npm run dev                # client + server concurrently
# or:
npm run client             # Vite on :5173
npm run server             # Express + nodemon on :5001
```

The Vite dev server proxies `/api/*` to `:5001`, so the frontend just calls
relative paths.

## Demo flow

1. **Sign in** at `/login` — either email/password (Create one) or
   **Continue with Google**.
2. **Generate a roadmap** for something concrete (e.g. "React basics", 4 weeks).
   The loader is a live timeline of agent steps — you'll see "Loading your
   learning history…", "Designing your weekly roadmap…", etc., streamed over SSE.
3. **Open Week 1**, scroll through the Tavily-fetched resources, and **take the
   quiz** (8 multiple-choice questions on first attempt).
4. **Deliberately get ≥3 questions wrong.** On the score screen, the
   **Adaptive retry** CTA appears (purple, with a sparkles icon).
5. Click it. The `retryGraph` runs Researcher and Quiz in parallel. A "Quick
   review first" card appears with 3 fresh resources targeting your wrong
   concepts, plus a "Start focused retry" button that loads a new, focused
   5-question quiz.
6. Pass the retry → next week unlocks.
7. **Finish all weeks** → the final ScoreScreen shows a celebration card
   ("🎉 Path complete") with CTAs back to the dashboard or to start a new path.
8. **Generate a second path on a different topic.** The streaming loader now
   says something like *"Found 3 past weak spots — Planner will address them"* —
   the Planner has pulled your historical weak concepts from Pinecone and is
   shaping the new roadmap around them.
9. **Visit `/my-paths` and `/weak-concepts`** to see the consolidated views.
   `/profile` lets you change your display name and password (or set one for
   the first time if you signed up via Google).

## Deployment

The split-deploy below is what I use: frontend on Vercel (free), backend on
Render (free), MongoDB Atlas (free), and the existing Pinecone / OpenAI /
Tavily / Resend / Google Cloud accounts. Total monthly cost: $0, with the
caveat that Render's free tier spins down after 15 minutes of inactivity
(first request after that takes ~30 seconds).

### Backend → Render

1. Push the repo to GitHub.
2. In Render, **New → Web Service**, pick the repo.
3. Settings:
   - **Root directory**: `server`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
   - **Node version**: 20+ (set `NODE_VERSION=20.20.2` in env if needed)
4. Add all the env vars from `server/.env.example`:
   - `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OPENAI_API_KEY`,
     `TAVILY_API_KEY`, `PINECONE_API_KEY`, `GOOGLE_CLIENT_ID`,
     `RESEND_API_KEY`, `EMAIL_FROM`
   - `CLIENT_ORIGIN` and `APP_URL` → your Vercel URL once you have it.
   - **Don't** set `PORT` — Render injects its own.
5. In MongoDB Atlas → Network Access, add `0.0.0.0/0` (or Render's outbound
   IPs) so the Render dyno can connect.
6. Deploy. Note the URL Render gives you, e.g.
   `https://skillpath-server.onrender.com`.

### Frontend → Vercel

1. Edit `client/vercel.json` and replace the placeholder backend URL with
   your Render URL. Commit + push.
2. In Vercel, **Add New → Project**, pick the repo.
3. Settings:
   - **Root directory**: `client`
   - Framework, build command, and output dir are auto-detected from
     `vercel.json`.
4. Deploy. You'll get a URL like `https://skillpath.vercel.app`.
5. In Google Cloud → OAuth client → *Authorized JavaScript origins*, add
   your production Vercel URL.
6. Go back to Render and set `CLIENT_ORIGIN` + `APP_URL` to your Vercel URL,
   then redeploy the backend.

### Why the rewrite

The frontend code calls `/api/*` directly. In dev, Vite proxies that to
`localhost:5001`. In production, `client/vercel.json` rewrites `/api/*` to
the Render backend, with a catch-all `/((?!api/).*)` rewrite to `/index.html`
so deep links (`/dashboard`, `/profile`, etc.) survive a hard refresh.
Same-origin from the browser's POV, so CORS isn't on the critical path, and
Vercel rewrites are pass-through so the SSE streaming endpoint
(`/api/roadmap/generate-stream`) keeps working without buffering.

### Avoiding cold starts on Render free

Either pay $7/mo for Render Starter (always-on), or set up a free uptime
pinger (UptimeRobot, cron-job.org) hitting
`https://your-backend/api/health` every 10 minutes during demo hours.

## Project layout

```
skillpath/
├── client/                          React + Vite frontend
│   ├── vercel.json                  Vercel config: /api rewrite + SPA fallback
│   └── src/
│       ├── App.jsx                  Routes + ProtectedRoute
│       ├── config.js                Google client ID
│       ├── components/
│       │   ├── AppShell.jsx         Shared sidebar + topbar + mobile drawer
│       │   └── Toast.jsx            Toast provider + useToast hook
│       ├── lib/
│       │   └── pathHelpers.js       deriveMeta() + timeAgo()
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── Login.jsx            Email/password + Google + Forgot link
│       │   ├── ResetPassword.jsx    Token-from-URL form, auto-signs in
│       │   ├── Dashboard.jsx        Stats, recent activity, path progress
│       │   ├── MyPaths.jsx          List view: search / filter / sort / bulk
│       │   ├── WeakConcepts.jsx     Cross-path weak concepts grouped by topic
│       │   ├── Profile.jsx          Name + password + avatar
│       │   ├── RoadmapGenerator.jsx Streaming generator with live agent log
│       │   ├── LearningNode.jsx     Per-week content + resources
│       │   └── Quiz.jsx             Quiz UI + adaptive retry flow
│       └── services/authService.js  JWT token helpers + auth API client
│
├── server/                          Express + LangGraph backend
│   └── src/
│       ├── index.js                 entry point, process-level error guards
│       ├── config/db.js             Mongo connection
│       ├── middleware/auth.js       JWT verification
│       ├── models/
│       │   ├── User.js              email, password (optional), googleId,
│       │   │                        avatarUrl, resetToken*, name
│       │   └── LearningPath.js      paths + nested learning nodes
│       ├── routes/
│       │   ├── auth.js              register, login, /me, PATCH /me,
│       │   │                        google, forgot/reset-password,
│       │   │                        change-password
│       │   └── roadmap.js           generate, generate-stream, my-paths,
│       │                            quiz, retry, evaluate, weak-concepts,
│       │                            DELETE / PATCH path
│       ├── controllers/
│       │   └── authController.js
│       ├── agent/
│       │   ├── graph.js             StateGraph definitions
│       │   │                        (plannerGraph, quizGraph, retryGraph)
│       │   ├── state.js             SkillPathState annotation
│       │   └── nodes/
│       │       ├── plannerNode.js   gpt-4o, weeks × LearningNode (Zod),
│       │       │                    accepts historicalWeakConcepts
│       │       ├── researcherNode.js Tavily search, classified resources
│       │       ├── quizNode.js      gpt-4o-mini, 8 MCQs (initial) / 5 (retry)
│       │       │                    with concept tags
│       │       └── evaluatorNode.js scores, updates path, stores wrong
│       │                            concepts to Pinecone, marks pathComplete
│       ├── services/
│       │   ├── memoryService.js     Pinecone + OpenAI embeddings
│       │   └── emailService.js      Resend wrapper (sendPasswordResetEmail)
│       └── __tests__/               vitest unit tests
│           ├── evaluatorNode.test.js
│           └── memoryService.test.js
│
└── SkillPathDesign/                 Design references (Figma exports)
```

## API surface (auth required unless noted)

### Auth (`/api/auth`)

| Method | Path | What it does |
|---|---|---|
| `POST` | `/register` | Create user, return JWT *(no auth)* |
| `POST` | `/login` | Email/password sign-in, return JWT *(no auth)* |
| `POST` | `/google` | Sign in with Google access token, return JWT *(no auth)* |
| `POST` | `/forgot-password` | Send reset email; always 200 (no enumeration) *(no auth)* |
| `POST` | `/reset-password` | Token + new password → set + sign in *(no auth)* |
| `GET` | `/me` | Full profile: avatarUrl, googleLinked, hasPassword, createdAt |
| `PATCH` | `/me` | Update display name |
| `POST` | `/change-password` | Verify current pwd (if any), set new |

### Roadmap (`/api/roadmap`)

| Method | Path | What it does |
|---|---|---|
| `POST` | `/generate` | One-shot roadmap generation (returns when done) |
| `POST` | `/generate-stream` | SSE: streams per-node progress |
| `GET` | `/my-paths` | List the user's paths with node summaries |
| `GET` | `/:pathId` | Full path with nodes |
| `DELETE` | `/:pathId` | Delete a path |
| `PATCH` | `/:pathId` | Rename topic / goal |
| `POST` | `/:pathId/node/:week/resources` | Tavily fetch for a week |
| `POST` | `/:pathId/node/:week/quiz` | First-time quiz generation (cached) |
| `POST` | `/:pathId/node/:week/retry` | Adaptive retry: review resources + focused quiz |
| `POST` | `/:pathId/node/:week/evaluate` | Score answers, persist weak concepts |
| `GET` | `/weak-concepts?topic=…` | Pinecone-backed weak concepts list |

## Tests

```bash
cd server && npm test
```

15 vitest specs cover the evaluator (scoring, pass/fail, week unlocking,
wrong-concept tagging, final-week pathComplete) and the memory service
(Pinecone upsert shape, topic-filtered queries, defensive handling of empty
matches). The LLM-calling nodes (planner, researcher, quiz) aren't unit
tested — they're verified end-to-end via the demo flow.

## Notes

- `quizQuestions` are cached on the node — re-visiting a week doesn't burn
  OpenAI credits. The retry route overwrites them with a new focused set.
- The `concept` field on each generated quiz question is what the Evaluator
  reads when storing weak concepts. Paths generated before that field was added
  fall back to a topic-rotation heuristic.
- Pinecone failures are non-fatal: the memory loader node swallows errors and
  the graph proceeds with empty `historicalWeakConcepts`. Memory is a soft
  signal, not a hard dependency.
- The streaming endpoint uses SSE via `fetch` + `ReadableStream` (not
  `EventSource`) so the JWT can travel in an `Authorization` header rather than
  a query param.
- Google OAuth uses the implicit `access_token` flow (not ID token) so we can
  render our own button. The backend validates `audience === GOOGLE_CLIENT_ID`
  via `getTokenInfo()` to prevent tokens from other apps being replayed.
- `forgot-password` always returns 200 OK even if the email isn't registered,
  to prevent email enumeration.
- The server installs `process.on('unhandledRejection', …)` and
  `'uncaughtException'` handlers as last-resort guards — third-party SDKs
  (Resend in particular) can fire async rejections after we've already handled
  the error path, which would otherwise crash the process.
