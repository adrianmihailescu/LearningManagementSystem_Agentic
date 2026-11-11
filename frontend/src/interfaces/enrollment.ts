import type { UserRecord } from "./auth";
import type { Course } from "./course";

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

export interface LearnerEnrollment {
  completedLessons: string[];
  quizResults: QuizAttempt[];
  assignmentSubmissions: AssignmentSubmission[];
}

export interface Enrollment extends LearnerEnrollment {
  _id: string;
  student: string | UserRecord;
  course: string | Course;
  progress?: number;
}

export interface SubmissionRecord extends Omit<Enrollment, "student" | "course"> {
  student: UserRecord;
}
