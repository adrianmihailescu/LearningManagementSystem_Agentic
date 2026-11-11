# SmartLearning project guidance

- Keep the React client, Express API, MongoDB models, and production runtime AI services in their respective `frontend/` and `backend/` boundaries.
- Development-time Copilot agents in `.github/agents/` are not production agents. Production AI orchestration belongs in `backend/src/agents/` and `backend/src/ai/`.
- Enforce authentication, role authorization, ownership, and request validation in the API; never rely on the client to protect data.
- Keep secrets in environment variables. Never commit `.env` files or provider keys.
- Preserve accessible labels, keyboard interaction, responsive layouts, and the dark SmartLearning visual language.
- Prefer focused changes; run the affected frontend build and validate backend modules before delivery.
