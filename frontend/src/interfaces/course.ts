import type { UserRecord } from "./auth";
import type { CourseLevel, LessonType } from "../types/course";

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
