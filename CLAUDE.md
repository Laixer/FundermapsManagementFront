# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fundermaps Management Front is an **admin-only** Vue 3 management portal for the Fundermaps platform. It manages organisations, users, applications, and mapsets. Only users with the `administrator` role can access the app (enforced via router guard).

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
- `endpoints/` - Domain-specific API functions (auth, user, building, management/*). Management endpoints use `v1/management/` prefix.
- `session.ts` - Token storage in `localStorage`. Manages access/refresh tokens and expiry.
- `api-key.ts` - Alternative API key auth mechanism.
- `errors.ts` - Custom error classes (`APICallError`, `APITokenError`, `APIErrorResponse`).

### State (`src/stores/`)

Single store: `session.ts` - Pinia store managing authentication state, current user, and token refresh interval.

### Routing (`src/router/`)

All routes are top-level (no nested routes). List views double as detail views via optional route params (e.g., `/user` and `/user/:userId` both render `UserListView`). Router guards redirect unauthenticated users to `/login` and non-admins to `/403`.

### Views (`src/views/`)

List views: `ApplicationListView`, `OrganisationListView`, `MapsetListView`, `UserListView`. Auth views: `Login`, `403`.

### Components (`src/components/`)

- `Common/` - Reusable UI primitives (buttons, inputs, modals, icons, links, cards)
- `Management/` - Domain forms and detail views (CRUD forms for users, orgs, applications, mapsets)
- `Layout/` - Page wrappers (`AuthWrapper`, `MainWrapper`, `Header`)
- `Branding/` - Logo variants and loading indicator

### Local Dev Proxy

A `Caddyfile` proxies `/api/*` to `https://api.fundermaps.com` and other traffic to the Vite dev server at `localhost:5173`.

## Code Style

- Prettier: no semicolons, single quotes, 100 char print width
- ESLint: Vue essential rules + TypeScript recommended
- SVGs loaded as Vue components via `vite-svg-loader`
- Node 22+ required
