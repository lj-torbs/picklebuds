# PickleBuddzy

PickleBuddzy is a React, TypeScript, Vite, Tailwind CSS, and shadcn/ui frontend. The current app includes a landing page plus login and signup screens.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Tailwind CSS 4
- shadcn/ui-style components
- lucide-react icons
- ESLint and Prettier

## Requirements

- Node.js 20.19+ or 22.12+
- npm, included with Node.js

This repo includes a `package-lock.json`, so use `npm ci` for reproducible installs when possible.

## Getting Started

Clone the repository, install dependencies, and start the Vite dev server:

```bash
git clone <repository-url>
cd picklebuddzy
npm ci
npm run dev
```

Vite will print the local URL in your terminal. By default it is usually:

```text
http://localhost:5173/
```

Available routes:

- `/` - landing page
- `/login` - login page
- `/signup` - signup page

### Windows PowerShell Note

If PowerShell blocks `npm` with an execution policy error, run npm through the command shim:

```powershell
npm.cmd ci
npm.cmd run dev
```

Alternatively, use Command Prompt, Git Bash, or update your PowerShell execution policy according to your team's workstation rules.

## Scripts

```bash
npm run dev
```

Starts the local Vite development server.

```bash
npm run build
```

Runs TypeScript project build checks and creates a production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for a final check.

```bash
npm run lint
```

Runs ESLint across the project.

```bash
npm run typecheck
```

Runs TypeScript without emitting files.

```bash
npm run format
```

Formats TypeScript and React source files with Prettier.

## Project Structure

```text
src/
  App.tsx                  Route selection for the current pathname
  main.tsx                 React entry point
  index.css                Tailwind, shadcn theme tokens, and global styles
  assets/                  Static assets imported by React
  components/
    auth/                  Login/signup composition
    landing/               Landing page sections
    ui/                    Reusable shadcn-style UI primitives
    theme-provider.tsx     Theme wrapper used by the app
  lib/
    utils.ts               Shared utilities
  pages/
    landing-page.tsx
    login-page.tsx
    signup-page.tsx
public/
  images/                  Public image assets
```

The `@` import alias points to `src`, so imports like `@/components/ui/button` are supported.

## Development Workflow

1. Create a feature branch from the latest main branch.
2. Run `npm ci` after pulling dependency changes.
3. Make focused changes in the relevant page, component, or style file.
4. Run `npm run lint`, `npm run typecheck`, and `npm run build` before opening a pull request.
5. Keep generated output such as `dist/` and `node_modules/` out of commits.

## Adding UI Components

This project is configured for shadcn/ui-style components with lucide icons and the `@/components` aliases in `components.json`.

To add another shadcn component:

```bash
npx shadcn@latest add button
```

Replace `button` with the component name you need. New UI primitives should live in `src/components/ui`.

## Contribution Guidelines

- Prefer small, reviewable pull requests.
- Follow the existing component organization under `src/components` and `src/pages`.
- Use the `@/` alias for imports from `src`.
- Keep shared UI primitives generic and place feature-specific composition closer to the feature.
- Run formatting and checks before requesting review.
- Document any new environment variables or setup steps in this README.

## Troubleshooting

If dependencies behave unexpectedly, remove `node_modules` and reinstall from the lockfile:

```bash
npm ci
```

If a dev server port is already in use, Vite will suggest another port in the terminal.
