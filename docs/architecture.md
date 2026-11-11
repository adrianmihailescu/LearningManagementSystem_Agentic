# SmartLearning architecture

## Application layers

- **React + TypeScript + Vite (`frontend/`)** renders the role-aware LMS, course catalog, lesson room, quiz interface, and tutor. Production builds run the TypeScript compiler before bundling.
- **Express (`backend/`)** provides JSON APIs, validates requests, authenticates JWT sessions, and enforces role and ownership policies.
- **MongoDB + Mongoose** persists users, course structures, enrollments, lesson completion, and quiz attempts.
- **Runtime AI (`backend/src/agents`, `backend/src/ai`)** selects a specialist prompt and calls the configured OpenAI or Gemini provider. It is separate from the workspace-only `.github/agents` personas.

## Request flow

1. The React app sends requests to `/api`; Vite proxies them to the API in development.
2. Protected routes validate a bearer JWT and load the current user from MongoDB.
3. Route middleware enforces role and ownership. Zod schemas validate write requests.
4. Course and progress data are persisted in MongoDB.
5. AI requests are rate limited, checked against role and enrollment context, and sent to the configured provider from the server only.

## Roles

- **Administrator:** platform-wide course and user administration.
- **Instructor:** create and update owned courses; generate course and quiz content.
- **Student:** view published courses, enroll, progress through lessons, submit quizzes, and request lesson-grounded tutoring.

New self-registered accounts are students. Promote instructors/admins using the seeded administrator account and the admin user API.

## Development agents

Six custom agents in `.github/agents/` are development-time Copilot customizations. They do not execute in production. Runtime specialist prompts and provider calls are implemented separately under `backend/src/`.
