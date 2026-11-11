import type { CourseLevel } from "../types/course";

export interface ManageForm {
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  tags: string;
  moduleTitle: string;
  lessonTitle: string;
  lessonContent: string;
  quizPrompt: string;
  quizOptions: string;
  quizAnswer: string;
  quizExplanation: string;
  assignmentTitle: string;
  assignmentInstructions: string;
}
