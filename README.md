# FundermapsManagementFront

> **Retired on 2026-10-29.** The admin portal moved into **FunderMapsStudio** as Beheer (studio.funderdata.nl/admin,
> 2026-10-26). admin.fundermaps.com redirects there, and the app `fundermaps-admin-prod` is deleted. This repo is archived
> and kept for reference.

Admin-only Vue 3 management portal for the FunderMaps platform — manages users,
organisations and mapsets. Access is restricted to users with the `administrator`
role (enforced via a router guard). Authentication is the session cookie the
FunderMaps API sets (Better Auth), shared by every `*.fundermaps.com` app; login
happens in the auth app.

**Stack:** Vue 3 (`<script setup>`), TypeScript, Pinia, Vue Router, Tailwind CSS 4,
Vite. Package manager: **pnpm**.

## Setup

```sh
pnpm install
```

### Develop (Vite dev server, port 5173)

```sh
pnpm dev
```

### Type-check + production build

```sh
pnpm build
```

### Lint / format

```sh
pnpm lint
pnpm format
```

## Configuration

Set `VITE_FUNDERMAPS_URL` to the API base URL (see `.env`). See
[Vite Configuration Reference](https://vite.dev/config/) for build options.
