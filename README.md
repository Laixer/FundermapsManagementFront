# FundermapsManagementFront

Admin-only Vue 3 management portal for the FunderMaps platform — manages users,
organisations and mapsets. Access is restricted to users with the `administrator`
role (enforced via a router guard). Authentication is OIDC (authorization-code +
PKCE) against the FunderMaps API.

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
