---
description: "Use when changing SmartLearning Mongoose models, MongoDB indexes, seed data, or persistence behavior."
applyTo: "backend/src/models/**/*.js"
---
# Database guidelines

- Represent ownership and role boundaries explicitly and add indexes for common lookup paths.
- Never store plaintext passwords or API credentials.
- Keep schema validation aligned with API request validation.
- Avoid destructive data migrations; describe required migration or re-seeding steps.
