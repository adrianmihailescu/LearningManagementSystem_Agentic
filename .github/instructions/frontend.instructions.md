---
description: "Use when building or modifying SmartLearning React pages, components, routing, styling, or API client behavior."
applyTo: "frontend/src/**/*.{ts,tsx,css}"
---
# Frontend guidelines

- Use the existing React Router, Axios client, and auth context patterns.
- Keep frontend source typed in TypeScript; prefer explicit API models over `any`.
- Keep API failures visible to users; do not replace failed requests with sample success data.
- Include accessible names for icon-only buttons and useful empty/loading/error states.
- Keep layouts responsive and match the airy light-blue SmartLearning UI.
- Do not put authorization or secret-bearing provider logic in the browser.
