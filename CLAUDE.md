# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fundermaps Management Front is an **admin-only** Vue 3 management portal for the Fundermaps platform. It manages users, organisations, and mapsets. Only users with the `administrator` role can access the app (enforced via router guard). Used by two people; will eventually be integrated into the maps app.

## Commands

The package manager is **pnpm** (`packageManager: pnpm@10.28.0`).

- `pnpm dev` - Start Vite dev server (port 5173)
- `pnpm build` - Type-check + production build (runs `vue-tsc --build` and `vite build` in parallel)
- `pnpm type-check` - TypeScript checking only (`vue-tsc --build`)
- `pnpm lint` - ESLint with auto-fix
- `pnpm format` - Prettier formatting for `src/`

No test framework is configured.

## Architecture

**Stack:** Vue 3 (Composition API, `<script setup>`), TypeScript, Pinia, Vue Router, Tailwind CSS 4 (CSS-first, via `@tailwindcss/vite`), Vite, Zod.

**Path aliases:** `@` = `src/`, `@assets` = `src/assets/`.

### API Layer (`src/services/fundermaps/`)

- `client.ts` - Core HTTP client wrapping `fetch`. Exports `get`, `post`, `put`, `del`. Constructs URLs from `VITE_FUNDERMAPS_URL` env var + `/api/` prefix. Handles auth headers (Bearer token or API key) automatically.
- `endpoints/management/user.ts` - User CRUD, password reset, API key management, role updates.
- `endpoints/management/organisation.ts` - Org CRUD, user/mapset membership, geolock management (districts, municipalities, neighborhoods).
- `endpoints/management/mapset.ts` - Mapset listing (read-only).
- `oidc.ts` - OIDC authorization-code + PKCE client (`client_id=managementfront`). Handles the login redirect, code exchange at `/auth/callback`, single-flight silent refresh, and RP-initiated logout (end-session with `id_token_hint`).
- `session.ts` - Stores the OIDC token set (access/refresh/id tokens + expiry) in `localStorage`.
- `api-key.ts` - Optional API key auth via `VITE_AUTH_KEY`; when set, overrides the Bearer token in `client.ts`.
- `errors.ts` - Custom error classes (`APICallError`, `APITokenError`, `APIErrorResponse`).

### State (`src/stores/`)

Single store: `session.ts` - Pinia store managing authentication state, current user, and timer-based token refresh. Login/logout go through the OIDC redirects in `services/oidc.ts`.

### Routing (`src/router/`)

All routes are top-level. Home (`/`) redirects to `/user`. The `/login` route kicks off the OIDC redirect and `/auth/callback` completes the code exchange. Router guards redirect unauthenticated users to `/login` and non-admins to `/403`.

### Views (`src/views/`)

- `UserListView` - User list + detail panel with role change, password reset, API key management, delete
- `OrganisationListView` - Org list + detail panel with tabs (Users, Mapsets, Geolock), edit name, delete
- `MapsetListView` - Read-only mapset list + detail panel
- Auth views: `Login` (OIDC redirect shim), `Callback` (OIDC code exchange), `403`

### Components (`src/components/`)

- `Common/` - Reusable UI primitives (buttons, inputs, modals, icons, links, cards)
- `Management/` - Domain forms and detail views. All lists use `Vue3Datatable` for consistency.
  - `Form.vue` / `FormCard.vue` - Generic form wrappers with validation (Zod), submit/cancel, inline mode
  - `RecordDetailsCard.vue` - Detail panel with edit/delete/close header buttons
  - `OrganisationUsersList.vue` / `OrganisationMapsetsList.vue` / `OrganisationGeolockSection.vue` - Org sub-lists
- `Layout/` - Page wrappers (`AuthWrapper`, `MainWrapper`, `Header`)
- `Branding/` - Logo and loading indicator

### Shared Utilities (`src/utils/`)

- `user.ts` - `renderUserName()` for display name formatting
- `password.ts` - `generateStrongPassword()` for user creation
- `string.ts` - String trimming helpers used by the API client

## Code Style

- Prettier: no semicolons, single quotes, 100 char print width
- ESLint: Vue essential rules + TypeScript recommended
- SVGs loaded as Vue components via `vite-svg-loader`
- All lists must use `Vue3Datatable` (type declaration in `src/types/vue3-datatable.d.ts`)
- Node 22+ required
