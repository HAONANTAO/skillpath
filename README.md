# SkillPath

An adaptive AI learning-path generator. Tell it what you want to learn, and a
LangGraph agent designs a week-by-week roadmap, fetches real resources, generates
quizzes, evaluates your answers, and adapts to your weak spots — both within a
path (retry with focused review) and across paths (Pinecone-backed long-term
memory feeds back into the planner).

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
│  · Dashboard    │ ◄────── │  /api/auth          JWT auth            │
│  · Roadmap gen  │         │  /api/roadmap/*     paths + nodes       │
│  · Learn node   │         │                                         │
│  · Quiz         │         │  Agents:                                │
└─────────────────┘         │   plannerGraph:  memory → planner       │
                            │   quizGraph:     memory → quiz          │
                            │   retryGraph:    researcher ∥ quiz      │
                            │   evaluatorNode  (direct call)          │
                            └────────────┬────────────────────────────┘
                                         │
                ┌────────────────┬───────┴────────┬─────────────────┐
                ▼                ▼                ▼                 ▼
          ┌──────────┐    ┌────────────┐   ┌────────────┐   ┌────────────┐
          │ MongoDB  │    │  OpenAI    │   │  Tavily    │   │  Pinecone  │
          │ (paths,  │    │  (gpt-4o,  │   │  (web      │   │  (weak-    │
          │  users)  │    │  gpt-4o-   │   │  search    │   │  concept   │
          │          │    │  mini, em- │   │  for       │   │  memory)   │
          │          │    │  beddings) │   │  resources)│   │            │
          └──────────┘    └────────────┘   └────────────┘   └────────────┘
```

## Tech stack

**Frontend**
- React 19 + Vite + React Router 7
- Tailwind 4 (via `@tailwindcss/vite`)
- Plain CSS for the design system (no UI library — all components hand-rolled)

**Backend**
- Express 4
- `@langchain/langgraph` 1.x for agent orchestration
- `@langchain/openai` for the chat models with structured (Zod) output
- Mongoose for MongoDB
- JWT auth (`bcryptjs` + `jsonwebtoken`)
- Server-Sent Events for streaming Planner progress

**External services**
- OpenAI (gpt-4o for planner, gpt-4o-mini for quiz, text-embedding-3-small for memory)
- Tavily (web search for learning resources)
- Pinecone (vector store for weak-concept memory; serverless index, cosine)
- MongoDB Atlas

## Setup

You'll need accounts on OpenAI, Tavily, Pinecone, and MongoDB Atlas. Free tiers
work for all four.

```bash
git clone <this repo>
cd skillpath

# Install root + client + server in one go
npm install
npm install --prefix client
npm install --prefix server

# Configure server env
cp server/.env.example server/.env
# then fill in the keys — see below
```

### Environment variables (`server/.env`)

```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pw>@cluster.mongodb.net/skillpath?retryWrites=true&w=majority
JWT_SECRET=<a long random string>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=tvly-...
PINECONE_API_KEY=pcsk-...
```

Note: MongoDB Atlas requires the running machine's IP to be in the Network
Access whitelist. The Pinecone index (`skillpath-memory`) is auto-created on
first write — no manual setup needed.

### Run

```bash
# From repo root — runs client and server concurrently
npm run dev

# Or individually
npm run client   # Vite dev server on http://localhost:5173
npm run server   # Express + nodemon on http://localhost:5001
```

The Vite dev server proxies `/api/*` to `:5001`, so the frontend just calls
relative paths.

## Demo flow

1. **Register** at `/login`.
2. **Generate a roadmap** for something concrete (e.g. "React basics", 4 weeks).
   The loader is a live timeline of agent steps — you'll see "Loading your
   learning history…", "Designing your weekly roadmap…", etc., streamed over SSE.
3. **Open Week 1**, scroll through the Tavily-fetched resources, and **take the
   quiz**.
4. **Deliberately get ≥3 questions wrong.** On the score screen, the
   **Adaptive retry** CTA appears (purple, with a sparkles icon).
5. Click it. The `retryGraph` runs Researcher and Quiz in parallel. A "Quick
   review first" card appears with 3 fresh resources targeting your wrong
   concepts, plus a "Start focused retry" button that loads a new, focused quiz.
6. Pass the retry → next week unlocks.
7. **Finish all weeks** → the final ScoreScreen shows a celebration card
   ("🎉 Path complete") with CTAs back to the dashboard or to start a new path.
8. **Generate a second path on a different topic.** The streaming loader now
   says something like *"Found 3 past weak spots — Planner will address them"* —
   the Planner has pulled your historical weak concepts from Pinecone and is
   shaping the new roadmap around them.

## Deployment

The split-deploy below is what I use: frontend on Vercel (free), backend on
Render (free), MongoDB Atlas (free), and the existing Pinecone / OpenAI /
Tavily accounts. Total monthly cost: $0, with the caveat that Render's free
tier spins down after 15 minutes of inactivity (first request after that
takes ~30 seconds).

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
     `TAVILY_API_KEY`, `PINECONE_API_KEY`
   - `CLIENT_ORIGIN` → your Vercel URL once you have it (you can come back
     and set this after step 2 of the frontend section)
   - **Don't** set `PORT` — Render injects its own.
5. In MongoDB Atlas → Network Access, add `0.0.0.0/0` (or Render's outbound
   IPs) so the Render dyno can connect.
6. Deploy. Note the URL Render gives you, e.g.
   `https://skillpath-server.onrender.com`.

### Frontend → Vercel

1. Edit `client/vercel.json` and replace the `REPLACE-WITH-YOUR-BACKEND`
   placeholder with the Render URL from the previous step. Commit + push.
2. In Vercel, **Add New → Project**, pick the repo.
3. Settings:
   - **Root directory**: `client`
   - The rest (framework, build command, output dir) is auto-detected from
     `vercel.json`.
4. Deploy. You'll get a URL like `https://skillpath.vercel.app`.
5. Go back to Render and set `CLIENT_ORIGIN` to that URL, then redeploy the
   backend (or just restart it — env changes don't always trigger an
   auto-redeploy on Render's free tier).

### Why the rewrite

The frontend code calls `/api/*` directly. In dev, Vite proxies that to
`localhost:5001`. In production, Vercel's `vercel.json` rewrite forwards
`/api/*` to the Render backend. Same code path, no `VITE_API_URL`
indirection, and the browser sees same-origin requests so CORS isn't on the
critical path. Vercel rewrites are pass-through, so the SSE streaming
endpoint (`/api/roadmap/generate-stream`) keeps working without buffering.

### Avoiding cold starts on Render free

Either pay $7/mo for Render Starter (always-on), or set up a free uptime
pinger (e.g. UptimeRobot, cron-job.org) hitting `https://your-backend/api/health`
every 10 minutes during demo hours.

## Project layout

```
skillpath/
├── client/                          React + Vite frontend
│   └── src/
│       ├── pages/                   LandingPage, Login, Dashboard,
│       │                            RoadmapGenerator, LearningNode, Quiz
│       └── services/authService.js  JWT token helpers
│
├── server/                          Express + LangGraph backend
│   └── src/
│       ├── index.js                 server entry point
│       ├── config/db.js             Mongo connection
│       ├── middleware/auth.js       JWT verification
│       ├── models/
│       │   ├── User.js
│       │   └── LearningPath.js      paths + nested learning nodes
│       ├── routes/
│       │   ├── auth.js              register / login
│       │   └── roadmap.js           generate, generate-stream, my-paths,
│       │                            quiz, retry, evaluate, weak-concepts,
│       │                            DELETE / PATCH path
│       ├── agent/
│       │   ├── graph.js             StateGraph definitions
│       │   │                        (plannerGraph, quizGraph, retryGraph)
│       │   ├── state.js             SkillPathState annotation
│       │   └── nodes/
│       │       ├── plannerNode.js   gpt-4o, weeks × LearningNode (Zod)
│       │       ├── researcherNode.js Tavily search, classified resources
│       │       ├── quizNode.js      gpt-4o-mini, 5 MCQs with concept tags
│       │       └── evaluatorNode.js scores, updates path, stores wrong
│       │                            concepts to Pinecone
│       └── services/
│           └── memoryService.js     Pinecone + OpenAI embeddings
│                                    (storeWeakConcept, getWeakConcepts)
│
└── SkillPathDesign/                 Design references (Figma exports)
```

## API surface (auth required unless noted)

| Method | Path | What it does |
|---|---|---|
| `POST` | `/api/auth/register` | Create user, return JWT *(no auth)* |
| `POST` | `/api/auth/login` | Return JWT *(no auth)* |
| `POST` | `/api/roadmap/generate` | One-shot roadmap generation (returns when done) |
| `POST` | `/api/roadmap/generate-stream` | SSE: streams per-node progress |
| `GET` | `/api/roadmap/my-paths` | List the user's paths |
| `GET` | `/api/roadmap/:pathId` | Full path with nodes |
| `DELETE` | `/api/roadmap/:pathId` | Delete a path |
| `PATCH` | `/api/roadmap/:pathId` | Rename topic / goal |
| `POST` | `/api/roadmap/:pathId/node/:week/resources` | Tavily fetch for a week |
| `POST` | `/api/roadmap/:pathId/node/:week/quiz` | First-time quiz generation (cached) |
| `POST` | `/api/roadmap/:pathId/node/:week/retry` | Adaptive retry: review resources + focused quiz |
| `POST` | `/api/roadmap/:pathId/node/:week/evaluate` | Score answers, persist weak concepts |
| `GET` | `/api/roadmap/weak-concepts?topic=…` | Pinecone-backed weak concepts list |

## Notes

- `quizQuestions` are cached on the node — re-visiting a week doesn't burn
  OpenAI credits.
- The `concept` field on each generated quiz question is what the Evaluator
  reads when storing weak concepts. Paths generated before that field was added
  fall back to a topic-rotation heuristic.
- Pinecone failures are non-fatal: the `memoryLoaderNode` swallows errors and
  the graph proceeds with empty `historicalWeakConcepts`. Memory is a soft
  signal, not a hard dependency.
- The streaming endpoint uses SSE via `fetch` + `ReadableStream` (not
  `EventSource`) so the JWT can travel in an `Authorization` header rather than
  a query param.
