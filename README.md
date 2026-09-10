# cursor-agent

A small full-stack **Tasks** app used to exercise the Cloud Agent development
environment end to end.

- **`server/`** — Express + TypeScript REST API backed by SQLite (`better-sqlite3`).
- **`web/`** — React + Vite + TypeScript single-page frontend.

The two packages are wired together with npm workspaces. The web dev server
proxies `/api` requests to the API server.

## Prerequisites

- Node.js >= 20 (developed against Node 22)
- npm 10+

## Getting started

```bash
npm ci        # install all workspace dependencies
npm run dev   # start the API (port 3001) and web (port 5173) together
```

Then open http://localhost:5173 and add, complete, and delete tasks.

## Common commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run API + web dev servers together |
| `npm run dev:server` | Run only the API server (port 3001) |
| `npm run dev:web` | Run only the web dev server (port 5173) |
| `npm run build` | Type-check and build both packages |
| `npm test` | Run the API test suite (Vitest + Supertest) |
| `npm run typecheck` | Type-check both packages |

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create a task (`{ "title": "..." }`) |
| `PATCH` | `/api/tasks/:id` | Update `title` and/or `done` |
| `DELETE` | `/api/tasks/:id` | Delete a task |

The API persists to `server/data/tasks.db` by default (override with `DB_FILE`).
