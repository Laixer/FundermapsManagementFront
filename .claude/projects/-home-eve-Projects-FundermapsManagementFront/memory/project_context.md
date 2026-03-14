---
name: project-context
description: Management portal context - legacy app, 2 users, Go backend, current feature state
type: project
---

This app is a management portal, only used by two people to manage Fundermaps. It was half finished but is now feature-complete for what the backend supports.

**Backend:** Go backend at `/home/eve/Projects/FunderMapsTest` (Fiber + GORM + PostgreSQL). No soft delete — all deletes are physical with cascade cleanup of junction tables.

**Current state (as of 2026-03-14):**
- Users: full CRUD, role change (user/admin), password reset, API key management (list/create/delete), last login display
- Organisations: create, edit name, delete, manage users with roles (reader/writer/verifier/superuser), manage mapsets (list/add/remove), geolock management (districts/municipalities/neighborhoods)
- Mapsets: read-only (list + detail view), no backend CRUD endpoints exist
- No soft delete in DB, no user/org delete endpoints existed before this session — we added them

**Will likely be integrated** into the maps app (FunderMaps frontend) as an admin page.

**How to apply:** The app is functionally complete. Future work should focus on the maps app integration rather than adding more features here.
