## Stack Choice
- Backend: Node.js (TypeScript) with Fastify; structured logging via Pino; validation with Zod; LLM adapter with timeouts/retries and JSON repair; persistence via SQLite (better-sqlite3) for jobs/artifacts; file uploads handled by Fastify multipart; rate limiting via Fastify plugin; environment config via dotenv + Zod.
- Frontend: Next.js (TypeScript) with full RTL and Persian UI; styling via CSS modules/Tailwind with RTL support; data fetching via REST endpoints.
- Containerization: Docker + docker-compose for backend, frontend, SQLite volume.

## Folder Structure
- backend/
  - package.json, tsconfig.json, .env.example
  - src/
    - server.ts (Fastify bootstrap)
    - plugins/ (logger, rateLimit, multipart, cors)
    - config/env.ts
    - logger/index.ts
    - routes/health.ts, routes/analyze.ts, routes/jobs.ts, routes/reports.ts, routes/clarifications.ts
    - services/
      - storage/sqlite.ts
      - llm/client.ts (provider abstraction, demo mode)
      - jobs/queue.ts (in-process job runner with persistence)
    - pipelines/
      - index.ts (orchestrator)
      - modules/module0-input.ts ... module8-output.ts
    - schemas/ (Zod schemas per module, requests, responses)
    - utils/json-repair.ts, utils/chunking.ts, utils/errors.ts
- frontend/
  - package.json, next.config.js, tsconfig.json
  - app/ or pages/ (Next 13+ app dir) with screens: upload, job status, dashboard
  - components/ (panels, layout, RTL typography, health widget, coverage map, evidence explorer)
  - lib/api.ts (API client)
  - public/ (assets)
- docker-compose.yml
- README.md (Persian)
- ASSUMPTIONS.md

## Endpoints
- `GET /api/health`: providerConfigured, model, version, uptime.
- `POST /api/analyze`: accepts text or file upload; creates job; returns `{ jobId }`.
- `GET /api/jobs/:id`: returns status (`queued|running|succeeded|failed`), progress %, partial results, missing info.
- `GET /api/jobs/:id/report`: returns final report JSON.
- `POST /api/jobs/:id/clarifications`: accept Persian answers to clarification questions, persist, allow re-run (assumption to meet UI need).

## Pipeline Steps (Modules 0–8)
- M0 Input Manager: extract/clean text, normalize Persian, chunk with deterministic IDs.
- M1 Document Classifier: type/domain/horizon/analytical level.
- M2 Coverage & Feasibility Scanner: flag modules active/partial/inactive with missing info.
- M3 Clarification Question Generator: Persian questions when modules are partial/inactive.
- M4 Evidence Extractor: claims/actors/events/metrics with chunk_id + snippet.
- M5 Futures Engines: trends, weak signals, critical uncertainties (conditional on M2).
- M6 Consistency & Critic Pass: contradictions, unsupported claims, fact/inference/assumption labels, confidence.
- M7 Scenario Mini-Engine: 2–3 scenarios when >=2 critical uncertainties.
- M8 Output Composer: executive brief, full report, dashboard-ready JSON (all Persian).

## Data Schemas (Zod)
- Request schemas: analyze input (text/file), clarification answers; health response.
- Core entities: Chunk `{chunk_id, text}`, Job `{id, status, progress, timestamps, inputMeta, moduleOutputs, clarifications, error?}` persisted in SQLite.
- Module outputs: classifier, coverage map, clarification questions, evidence items `{type, chunk_id, snippet, content}`, trend/weak signal/uncertainty items referencing evidence IDs, critic labels `{fact|inference|assumption, confidence}`, scenarios with indicators.
- Report schema: assembled Persian report + structured JSON per dashboard panel.
- Logging/meta: requestId propagation and audit trail per module run (start/end, retries).
