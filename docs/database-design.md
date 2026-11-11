# Database design

## User

Stores display name, unique normalized email, password hash, role (`admin`, `instructor`, `student`), and optional avatar. Password is excluded from normal queries and hashed with bcrypt before persistence.

## Course

Owned by an instructor and contains title, description, category, difficulty, tags, publication status, modules, lessons, and embedded quiz questions. Lessons support text, video, code, and file resource types.

## Enrollment

References one student and one course; a unique compound index prevents duplicate enrollment. Tracks completed lesson IDs and quiz attempts with score and timestamp.

## Relationships and access

- A course belongs to an instructor.
- Students have many enrollments; an enrollment belongs to one course and one student.
- Administrators may manage all users and courses; instructors may change only their own courses; students may update only their own enrollments.
- Quiz answer keys are stored with course content but should only be exposed through the quiz submission result, not a student-facing course response.
