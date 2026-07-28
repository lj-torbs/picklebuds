# PickleBuddzy

PickleBuddzy is a React, TypeScript, Vite, Tailwind CSS, and shadcn/ui frontend for a pickleball court-booking platform. There is no backend yet: login sessions (player, admin, owner) persist in `localStorage`, but bookings, gyms/courts, transactions, and user records live only in in-memory React state seeded with mock data, so a page refresh resets them. Think of it as a clickable UI/UX prototype for three separate roles:

- **Player** — browse gyms/courts, book a time slot, manage bookings, notifications, and profile.
- **Admin** — platform-wide oversight: all transactions, all gyms/courts, and all registered players.
- **Owner** — a gym/court operator scoped to only the venue(s) they own: their bookings, their courts, their pricing/availability.

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

**Player** (public pages, plus a session-gated app):

- `/` - landing page
- `/login`, `/signup`, `/forgot-password` - auth screens
- `/booking` - search gyms/courts and reserve a time slot _(requires login)_
- `/my-bookings` - view, reschedule, or cancel bookings _(requires login)_
- `/notifications`, `/profile` - account pages _(requires login)_

**Admin** (`/admin/login`, then gated behind its own session):

- `/admin/dashboard` - revenue and booking activity across the whole platform
- `/admin/transactions` - search/filter every booking, change status, issue refunds
- `/admin/gyms` - manage every venue and its courts (add/edit/deactivate/remove)
- `/admin/users` - search players, view booking history, suspend/reactivate accounts

**Owner** (`/owner/login`, then gated behind its own session):

- `/owner/dashboard` - stats scoped to the gyms this owner account owns
- `/owner/gyms` - edit their own venue(s) and manage courts (owners can't add/remove a whole gym — that's admin-only)
- `/owner/transactions` - bookings made at their venues only

Login on every role is a mock: any email/password combination signs you in (there's no real backend to check credentials against). For the owner role specifically, two demo emails resolve to specific seeded venues so you can see per-owner scoping — `priya@northsidepb.com` (Northside + Central) and `marcus@riversidesports.com` (Riverside). Any other email defaults to Priya's account.

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

The codebase is split by **role**, not just by file type. Player-facing code lives at the top level of `src/`; `admin/` and `owner/` are self-contained role folders with their own auth, layout, and pages; `shared/` holds the data and UI that admin and owner both need so they stay backed by one consistent dataset instead of two diverging copies.

```text
src/
  App.tsx                  Route tree for all three roles
  main.tsx                 React entry point; mounts every context provider
  index.css                Tailwind, shadcn theme tokens, and global styles
  assets/                  Static assets imported by React

  # --- Player (default export of the app) ---
  components/
    auth/                  Login/signup card, RequireAuth route guard
    landing/                Landing page sections
    ui/                     Reusable shadcn-style UI primitives (button, card, sheet, toast, ...)
    theme-provider.tsx      Theme wrapper used by the app
  lib/
    auth-context.tsx        Mock player session (localStorage-backed)
    bookings-context.tsx    Mock "my bookings" data for the logged-in player
    utils.ts                 cn() helper (clsx + tailwind-merge)
    validation.ts             zod schemas for login/signup
  pages/
    landing-page.tsx, login-page.tsx, signup-page.tsx, forgot-password-page.tsx,
    booking-page.tsx, my-bookings-page.tsx, notifications-page.tsx, profile-page.tsx

  # --- Admin role ---
  admin/
    lib/
      admin-auth-context.tsx    Mock admin session (separate from player/owner)
      admin-users-context.tsx   Player accounts admin can search/suspend
    components/
      require-admin-auth.tsx    Route guard for /admin/*
      layout/                    Sidebar + shell (Dashboard, Transactions, Gyms & Courts, Users)
      users/                     User status badge, user detail sheet
    pages/
      admin-dashboard-page.tsx, admin-transactions-page.tsx,
      admin-gyms-page.tsx, admin-users-page.tsx

  # --- Owner role ---
  owner/
    lib/
      owner-auth-context.tsx    Mock owner session; maps demo emails to seeded ownerIds
    components/
      require-owner-auth.tsx    Route guard for /owner/*
      layout/                    Sidebar + shell (Dashboard, My Gyms, Transactions)
    pages/
      owner-login-page.tsx, owner-dashboard-page.tsx,
      owner-gyms-page.tsx, owner-transactions-page.tsx

  # --- Shared between admin and owner ---
  shared/
    lib/
      gyms-context.tsx          Gym/Court data; Gym.ownerId links a venue to its owner
      transactions-context.tsx  Booking/transaction data; gymId/courtId link back to gyms-context
    components/
      stat-card.tsx
      gyms/                     GymCard, GymFormSheet, CourtFormSheet, status badges
      transactions/             TransactionsManager (search+filter+table+detail sheet), status badges

public/
  images/                  Public image assets
```

The `@` import alias points to `src`, so imports like `@/components/ui/button`, `@/admin/lib/admin-auth-context`, or `@/shared/lib/gyms-context` are supported.

A note on the data model: `admin/` and `owner/` never keep their own copy of gyms or transactions — both read from the same `shared/lib/gyms-context.tsx` and `shared/lib/transactions-context.tsx`, filtered differently per role (admin sees everything; an owner sees only gyms where `ownerId` matches their account, and only transactions whose `gymId` falls under those gyms). If you add a feature that needs gym or transaction data, extend the shared context rather than forking it.

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
- Follow the existing component organization under `src/components` and `src/pages` for player-facing work, or the matching `admin/`/`owner/` folder for role-specific work.
- Use the `@/` alias for imports from `src`.
- Keep shared UI primitives generic and place feature-specific composition closer to the feature.
- If a piece of UI or data is needed by both `admin/` and `owner/`, put it in `shared/` instead of duplicating it into one role's folder — that's how the two stay backed by the same dataset.
- Run formatting and checks before requesting review.
- Document any new environment variables or setup steps in this README.

## Troubleshooting

If dependencies behave unexpectedly, remove `node_modules` and reinstall from the lockfile:

```bash
npm ci
```

If a dev server port is already in use, Vite will suggest another port in the terminal.
