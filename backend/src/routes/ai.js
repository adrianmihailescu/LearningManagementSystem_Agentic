import { Router } from "express";
import { z } from "zod";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { requireAuth } from "../middleware/auth.js";
import { runAgent } from "../ai/provider.js";

const router = Router();
const input = z.object({
  intent: z.enum(["tutor", "course", "outline", "quiz", "assessment", "evaluate", "performance", "path", "recommend"]).default("tutor"),
  message: z.string().trim().min(1).max(4000),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(4000),
  })).max(12).optional(),
  courseId: z.string().optional(),
});

router.post("/chat", requireAuth, async (req, res, next) => {
  try {
    const data = input.parse(req.body);
    if (["course", "outline", "quiz", "assessment"].includes(data.intent) && !["admin", "instructor"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only instructors and administrators can generate course or quiz content." });
    }
    let context = "";
    if (data.courseId) {
      const course = await Course.findById(data.courseId);
      if (!course) return res.status(404).json({ error: "Course not found." });
      if (req.user.role === "student") {
        const enrolled = await Enrollment.exists({ student: req.user.id, course: course.id });
        if (!enrolled) return res.status(403).json({ error: "Enroll in this course to use its lesson context." });
      } else if (req.user.role === "instructor" && String(course.instructor) !== req.user.id) {
        return res.status(403).json({ error: "You can only use AI with courses you teach." });
      }
      context = `${course.title}\n${course.description}\n${course.modules.map((module) =>
        `${module.title}\n${module.lessons.map((lesson) => `${lesson.title}\n${lesson.content}`).join("\n")}`).join("\n")}`;
    }
    if (req.user.role === "student" && ["evaluate", "performance", "path", "recommend"].includes(data.intent)) {
      const filter = { student: req.user.id, ...(data.courseId ? { course: data.courseId } : {}) };
      const enrollments = await Enrollment.find(filter).populate("course", "title modules.title modules.lessons.title").limit(50);
      if (data.courseId && enrollments.length === 0) return res.status(403).json({ error: "Enroll in this course to use your learning results." });
      if (enrollments.length === 0) return res.status(400).json({ error: "Enroll in a course before requesting a personalized learning analysis." });
      const progressContext = enrollments.map((enrollment) => {
        const course = enrollment.course;
        const lessonNames = course.modules.flatMap((module) => module.lessons.map((lesson) => `${lesson._id}:${lesson.title}`));
        const completedNames = lessonNames.filter((lesson) => enrollment.completedLessons.includes(lesson.split(":")[0])).map((lesson) => lesson.split(":")[1]);
        const quizScores = enrollment.quizResults.map((result) => `${result.score}/${result.total}`).join(", ") || "no quiz attempts";
        return `${course.title}: completed ${completedNames.length}/${lessonNames.length} lessons (${completedNames.join(", ") || "none"}); quiz results: ${quizScores}.`;
      }).join("\n");
      context = `${context}\n\nLearner progress and assessment evidence:\n${progressContext}`;
    }
    const result = await runAgent({
      intent: data.intent,
      context,
      messages: [...(data.history || []), { role: "user", content: data.message }],
    });
    res.json(result);
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});
export default router;
