---
description: "Use when modifying SmartLearning Node.js/Express routes, middleware, services, or runtime AI integration."
applyTo: "backend/src/**/*.js"
---
# Backend guidelines

- Validate all external input and return clear HTTP errors for invalid, unauthorized, or unavailable operations.
- Apply authentication, role checks, and resource ownership checks at the API boundary.
- Keep provider credentials on the server and return explicit errors for unavailable AI services.
- Keep route handlers small and follow the existing Express and ES module conventions.
