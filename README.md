# SmartLearning

SmartLearning is a role-aware learning management system with a React client, a Node.js/Express API, MongoDB persistence, and provider-backed runtime AI agents.

## Requirements

- Node.js 20+
- npm
- Docker Desktop (or a local MongoDB instance)
- An OpenAI or Gemini API key to use runtime AI features

## Run locally

1. Start MongoDB: `docker compose up -d mongodb`
2. Copy `backend/.env.example` to `backend/.env` and set `JWT_SECRET`. Add an AI key to enable AI tools.
3. From the repository root, run `npm install` and then `npm run install:all`.
4. Seed sample courses and demo accounts: `npm run seed`
5. Start the API and frontend: `npm run dev`
6. Open http://localhost:5173.

Demo accounts (password: `SmartLearn123!`):

- Admin: `admin@smartlearning.local`
- Instructor: `instructor@smartlearning.local`
- Student: `student@smartlearning.local`

The API listens on port 4000. AI endpoints return an explicit service-unavailable error until an AI provider and API key are configured; normal LMS features do not require AI credentials.

## Roles

- **Administrator:** manage users and the platform.
- **Instructor:** create and manage courses, lessons, and quizzes.
- **Student:** enroll, learn, take quizzes, and track progress.

## Project layout

- `.github/agents/` contains development-time Copilot agents.
- `backend/src/agents/` and `backend/src/ai/` contain production runtime agent behavior.
- `frontend/` contains the React application.
- Frontend React components, pages, auth, and API client use TypeScript (`.tsx`/`.ts`); `npm run build` type-checks before bundling.
- `docs/` describes architecture, data, and API contracts.

See [architecture](docs/architecture.md), [database design](docs/database-design.md), and [API specification](docs/api-specification.md).
