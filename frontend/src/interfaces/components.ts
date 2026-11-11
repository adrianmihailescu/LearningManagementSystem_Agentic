import type { Course } from "./course";

export interface CourseCardProps {
  course: Course;
  progress?: number;
  onEnroll?: (course: Course) => void;
  canEnroll?: boolean;
}

export interface NoticeProps {
  message: string;
  onClose: () => void;
}
