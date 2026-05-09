# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fundermaps Management Front is an **admin-only** Vue 3 management portal for the Fundermaps platform. It manages users, organisations, and mapsets. Only users with the `administrator` role can access the app (enforced via router guard). Used by two people; will eventually be integrated into the maps app.

## Commands

- `npm run dev` - Start Vite dev server (port 5173)
- `npm run build` - Type-check + production build (runs `vue-tsc --build` and `vite build` in parallel)
- `npm run type-check` - TypeScript checking only (`vue-tsc --build`)
- `npm run lint` - ESLint with auto-fix
- `npm run format` - Prettier formatting for `src/`

No test framework is configured.

## Architecture

**Stack:** Vue 3 (Composition API, `<script setup>`), TypeScript, Pinia, Vue Router, Tailwind CSS 3, Vite, Zod.

**Path aliases:** `@` = `src/`, `@assets` = `src/assets/`.

### API Layer (`src/services/fundermaps/`)

- `client.ts` - Core HTTP client wrapping `fetch`. Exports `get`, `post`, `put`, `del`. Constructs URLs from `VITE_FUNDERMAPS_URL` env var + `/api/` prefix. Handles auth headers (Bearer token or API key) automatically.
- `endpoints/management/user.ts` - User CRUD, password reset, API key management, role updates.
- `endpoints/management/organisation.ts` - Org CRUD, user/mapset membership, geolock management (districts, municipalities, neighborhoods).
- `endpoints/management/mapset.ts` - Mapset listing (read-only).
- `session.ts` - Token storage in `localStorage`. Manages access/refresh tokens and expiry.
- `api-key.ts` - Alternative API key auth mechanism.
- `errors.ts` - Custom error classes (`APICallError`, `APITokenError`, `APIErrorResponse`).

### State (`src/stores/`)

Single store: `session.ts` - Pinia store managing authentication state, current user, and token refresh interval.

### Routing (`src/router/`)

All routes are top-level. Home (`/`) redirects to `/user`. Router guards redirect unauthenticated users to `/login` and non-admins to `/403`.

### Views (`src/views/`)

- `UserListView` - User list + detail panel with role change, password reset, API key management, delete
- `OrganisationListView` - Org list + detail panel with tabs (Users, Mapsets, Geolock), edit name, delete
- `MapsetListView` - Read-only mapset list + detail panel
- Auth views: `Login`, `403`

### Components (`src/components/`)

- `Common/` - Reusable UI primitives (buttons, inputs, modals, icons, links, cards)
- `Management/` - Domain forms and detail views. All lists use `Vue3Datatable` for consistency.
  - `Form.vue` / `FormCard.vue` - Generic form wrappers with validation (Zod), submit/cancel, inline mode
  - `RecordDetailsCard.vue` - Detail panel with edit/delete/close header buttons
  - `OrganisationUsersList.vue` / `OrganisationMapsetsList.vue` / `OrganisationGeolockSection.vue` - Org sub-lists
- `Layout/` - Page wrappers (`AuthWrapper`, `MainWrapper`, `Header`)
- `Branding/` - Logo variants and loading indicator

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
