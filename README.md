# PickleBuddy

React, TypeScript, and Vite frontend for the PickleBuddy platform.

This repo now works against the separate `picklebuddy-api` backend repo. For the current team handoff, keep both repos in the same parent folder:

```text
picklebuddy-workspace/
  picklebuddy-api/
  picklebuddzy/
```

## Development

### Full stack with Docker

Use this when a teammate needs to run the same frontend, backend, and MySQL database setup without installing Python, Node dependencies, or MySQL locally.

```powershell
cd picklebuddzy
docker compose up --build -d
```

Apps:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8001`
- Backend health check: `http://localhost:8001/health`

Stop everything:

```powershell
docker compose down
```

Reset the Docker database and re-import `picklebuddy.sql`:

```powershell
docker compose down -v
docker compose up --build -d
```

### Standard dev mode

```powershell
cd picklebuddzy
npm install
npm run dev
```

That is the fastest local workflow for frontend changes.

## Requirements

- Docker Desktop for the full-stack handoff setup
- Node.js 20.19+ or 22.12+ and npm for frontend-only development

## Scripts

```bash
npm run dev
```

Starts the frontend development workflow.

```bash
npm run build
```

Builds the production frontend.

```bash
npm run lint
```

Runs ESLint.

```bash
npm run typecheck
```

Runs TypeScript checks.

## Notes for teammates

- This repo depends on the separate `picklebuddy-api` repo for live data.
- The shared Docker setup assumes both repos are siblings:

```text
picklebuddy-workspace/
  picklebuddy-api/
  picklebuddzy/
```

- The frontend compose file builds the backend from `../picklebuddy-api`.
- If you only clone this repo, owner/player/admin flows that depend on the backend will not be fully reproducible.
