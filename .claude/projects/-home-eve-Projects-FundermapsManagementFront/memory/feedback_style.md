---
name: feedback-style
description: User preferences for code style and workflow in this project
type: feedback
---

Keep UI consistent — don't mix list styles. All lists should use Vue3Datatable, not custom markup.

**Why:** User flagged inconsistency when API keys and geolock used custom div lists while everything else used Vue3Datatable.

**How to apply:** When adding any new list of items, always use Vue3Datatable with column definitions and action slots, matching the pattern in OrganisationUsersList.vue.
