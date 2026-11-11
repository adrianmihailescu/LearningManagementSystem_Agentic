import type { AuthenticatedUser, UserRecord } from "./auth";
import type { Course, CourseDetail } from "./course";
import type { LearnerEnrollment } from "./enrollment";

export interface CourseListResponse {
  courses: Course[];
}

export interface CourseDetailResponse {
  course: CourseDetail;
  enrollment: LearnerEnrollment | null;
}

export interface UserListResponse {
  users: UserRecord[];
}

export interface CurrentUserResponse {
  user: AuthenticatedUser;
}

export interface SignInResponse {
  token: string;
  user: AuthenticatedUser;
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
