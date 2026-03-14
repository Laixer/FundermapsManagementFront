---
name: reference-backend
description: Go backend location and API patterns for FunderMapsTest
type: reference
---

Go backend is at `/home/eve/Projects/FunderMapsTest`.

- Routes: `cmd/server/main.go`
- Management handlers: `app/handlers/management/` (user.go, organization.go, mapset.go)
- Models: `app/database/models.go`
- Auth middleware: `app/middleware/auth.go` and `app/middleware/admin.go`

Go is not installed on the dev machine — can't compile/test, but code follows established patterns. Always check the backend for existing endpoints before building frontend features.
