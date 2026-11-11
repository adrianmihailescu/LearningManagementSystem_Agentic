export type UserRole = "admin" | "instructor" | "student";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type LessonType = "text" | "video" | "code" | "file";

export interface QuizQuestion {
  _id: string;
  prompt: string;
  type: "multiple-choice" | "true-false";
  options: string[];
  answerIndex?: number;
  explanation?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  type: LessonType;
  content: string;
  durationMinutes: number;
  resourceUrl?: string;
  codeExample?: string;
}

export interface Assignment {
  _id: string;
  title: string;
  instructions: string;
  maxScore: number;
}

export interface CourseModule {
  _id: string;
  title: string;
  lessons: Lesson[];
  quiz: QuizQuestion[];
  assignments: Assignment[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  coverColor?: string;
  tags: string[];
  instructor: string | Pick<UserRecord, "_id" | "name">;
  modules?: CourseModule[];
  published: boolean;
  lessonCount?: number;
  enrolled?: boolean;
  progress?: number;
  completedLessons?: string[];
}

export interface CourseDetail extends Course {
  modules: CourseModule[];
}

export interface QuizAttempt {
  moduleId: string;
  score: number;
  total: number;
  submittedAt?: string;
}

export interface AssignmentSubmission {
  _id?: string;
  assignmentId: string;
  answer: string;
  submittedAt?: string;
  score?: number;
  feedback?: string;
}

export interface Enrollment {
  _id: string;
  student: string | UserRecord;
  course: string | Course;
  completedLessons: string[];
  quizResults: QuizAttempt[];
  assignmentSubmissions: AssignmentSubmission[];
  progress?: number;
}

export interface CourseListResponse {
  courses: Course[];
}

export interface CourseDetailResponse {
  course: CourseDetail;
  enrollment: LearnerEnrollment | null;
}

export interface LearnerEnrollment {
  completedLessons: string[];
  quizResults: QuizAttempt[];
  assignmentSubmissions: AssignmentSubmission[];
}

export interface UserListResponse {
  users: UserRecord[];
}

export interface SubmissionRecord extends Omit<Enrollment, "student" | "course"> {
  student: UserRecord;
}

export interface QuizSubmissionResult {
  score: number;
  total: number;
  results: Array<{
    correct: boolean;
    answerIndex: number;
    explanation: string;
  }>;
}

export type AiIntent =
  | "tutor"
  | "course"
  | "outline"
  | "quiz"
  | "assessment"
  | "evaluate"
  | "performance"
  | "path"
  | "recommend";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CourseCreateInput {
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  tags: string[];
  modules: Array<{
    title: string;
    lessons: Array<Pick<Lesson, "title" | "type" | "content" | "durationMinutes">>;
    quiz: Array<Pick<QuizQuestion, "prompt" | "options" | "answerIndex" | "explanation">>;
    assignments: Array<Pick<Assignment, "title" | "instructions">>;
  }>;
}
