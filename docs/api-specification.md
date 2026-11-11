# API specification

All responses are JSON. Protected endpoints require `Authorization: Bearer <token>`. Errors have the form `{ "error": "Readable explanation" }`.

## Authentication

- `POST /api/auth/register` — create a student account (`name`, `email`, `password`).
- `POST /api/auth/login` — authenticate (`email`, `password`).
- `GET /api/auth/me` — current account.

## Courses and learning

- `GET /api/courses?category=&search=` — published catalog; optional bearer token adds enrollment state.
- `POST /api/courses` — instructor/admin creates a course.
- `GET /api/courses/mine` — student's enrolled courses, or courses owned by instructor/admin.
- `GET /api/courses/:courseId` — course detail and current learner enrollment state.
- `PUT /api/courses/:courseId` — owner/admin updates a course.
- `POST /api/courses/:courseId/enroll` — student enrolls.
- `POST /api/courses/:courseId/progress` — student marks `{ "lessonId": "..." }` complete.
- `POST /api/courses/:courseId/quiz/:moduleId/submit` — student submits `{ "answers": [0, 2] }`.
- `POST /api/courses/:courseId/assignment/:moduleId/:assignmentId/submit` — student submits `{ "answer": "..." }`.
- `GET /api/courses/:courseId/submissions` — instructor/admin reviews submitted assignment work.
- `PATCH /api/courses/:courseId/submissions/:studentId/:assignmentId` — instructor/admin saves `{ "score": 85, "feedback": "..." }`.

## Administration

- `GET /api/users` — admin lists users.
- `PATCH /api/users/:userId/role` — admin changes `{ "role": "instructor" }`.

## AI

- `POST /api/ai/chat` — authenticated user sends `{ "intent": "tutor", "message": "...", "courseId": "optional" }`.
- Instructor/admin intents: `course`, `outline`, `quiz`, `assessment`.
- Learner intents: `tutor`, `evaluate`, `performance`, `path`, `recommend`.
- Configure `AI_PROVIDER=openai|gemini` and `AI_API_KEY`; optional `AI_MODEL` selects the provider model.
