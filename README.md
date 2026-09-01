# PickleBuddzy

React, TypeScript, and Vite frontend for the PickleBuddy platform.

This repo now works against the separate `picklebuddy-api` backend repo. For the current team handoff, keep both repos in the same parent folder:

```text
picklebuddy-workspace/
  picklebuddy-api/
  picklebuddzy/
```

## Development

### Standard dev mode

```powershell
cd picklebuddzy
npm install
npm run dev
```

That is the fastest local workflow for frontend changes.

### Docker workspace mode

Use the tracked compose file from the backend repo:

```powershell
cd picklebuddy-api
docker compose -f docker-compose.workspace.yml up --build -d
```

Apps:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8001`

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- Docker Desktop if using containerized setup

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
- The shared Docker setup is versioned in `picklebuddy-api/docker-compose.workspace.yml`.
- If you only clone this repo, owner/player/admin flows that depend on the backend will not be fully reproducible.
