import { Router } from "express";
import { z } from "zod";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { allowRoles, optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();
const quizQuestion = z.object({
  prompt: z.string().min(3).max(1000),
  type: z.enum(["multiple-choice", "true-false"]).optional(),
  options: z.array(z.string().max(300)).min(2).max(6),
  answerIndex: z.number().int().min(0),
  explanation: z.string().max(1000).optional(),
}).refine((question) => question.answerIndex < question.options.length, {
  message: "The correct answer must match one of the provided options.",
});
const courseInput = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(3000),
  category: z.string().trim().min(2).max(80),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  coverColor: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
  tags: z.array(z.string().max(40)).max(12).optional(),
  modules: z.array(z.object({
    title: z.string().min(2).max(160),
    lessons: z.array(z.object({
      title: z.string().min(2).max(160),
      type: z.enum(["text", "video", "code", "file"]).optional(),
      content: z.string().max(12000).optional(),
      durationMinutes: z.number().int().min(1).max(600).optional(),
      resourceUrl: z.string().max(2000).optional(),
      codeExample: z.string().max(12000).optional(),
    })).max(40).optional(),
    quiz: z.array(quizQuestion).max(50).optional(),
    assignments: z.array(z.object({
      title: z.string().min(2).max(160),
      instructions: z.string().min(5).max(4000),
      maxScore: z.number().int().min(1).max(1000).optional(),
    })).max(20).optional(),
  })).max(30).optional(),
  published: z.boolean().optional(),
});

router.get("/", optionalAuth, async (req, res, next) => {
  try {
    const filter = { published: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.$text = { $search: String(req.query.search) };
    const courses = await Course.find(filter).populate("instructor", "name").sort({ createdAt: -1 }).limit(100);
    const ids = req.user?.role === "student"
      ? new Set((await Enrollment.find({ student: req.user.id }).distinct("course")).map(String))
      : new Set();
    res.json({ courses: courses.map((course) => {
      const data = course.toObject();
      const lessonCount = course.modules.reduce((count, module) => count + module.lessons.length, 0);
      delete data.modules;
      return { ...data, enrolled: ids.has(String(course.id)), lessonCount };
    }) });
  } catch (error) { next(error); }
});

router.post("/", requireAuth, allowRoles("admin", "instructor"), async (req, res, next) => {
  try {
    const data = courseInput.parse(req.body);
    const course = await Course.create({ ...data, instructor: req.user.id });
    res.status(201).json({ course });
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    if (req.user.role === "student") {
      const enrollments = await Enrollment.find({ student: req.user.id }).populate({
        path: "course", populate: { path: "instructor", select: "name" },
      });
      return res.json({ courses: enrollments.filter((item) => item.course).map((item) => {
        const data = item.course.toObject();
        const lessonCount = item.course.modules.reduce((n, module) => n + module.lessons.length, 0);
        delete data.modules;
        return {
          ...data,
          lessonCount,
          completedLessons: item.completedLessons,
          progress: lessonCount ? Math.round(item.completedLessons.length * 100 / lessonCount) : 0,
        };
      }) });
    }
    const filter = req.user.role === "admin" ? {} : { instructor: req.user.id };
    res.json({ courses: await Course.find(filter).sort({ updatedAt: -1 }) });
  } catch (error) { next(error); }
});

router.get("/:courseId", optionalAuth, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId).populate("instructor", "name");
    if (!course || (!course.published && (!req.user || (req.user.role !== "admin" && String(course.instructor.id) !== req.user.id)))) {
      return res.status(404).json({ error: "Course not found." });
    }
    const enrollment = req.user?.role === "student"
      ? await Enrollment.findOne({ student: req.user.id, course: course.id }) : null;
    const courseData = course.toObject();
    const canReviewAnswers = req.user?.role === "admin"
      || (req.user?.role === "instructor" && String(course.instructor.id) === req.user.id);
    if (!canReviewAnswers) {
      courseData.modules = courseData.modules.map((module) => ({
        ...module,
        quiz: module.quiz.map(({ answerIndex: _answerIndex, ...question }) => question),
      }));
    }
    res.json({ course: courseData, enrollment: enrollment && {
      completedLessons: enrollment.completedLessons,
      quizResults: enrollment.quizResults,
      assignmentSubmissions: enrollment.assignmentSubmissions,
    } });
  } catch (error) { next(error); }
});

router.put("/:courseId", requireAuth, allowRoles("admin", "instructor"), async (req, res, next) => {
  try {
    const data = courseInput.partial().parse(req.body);
    const filter = req.user.role === "admin" ? { _id: req.params.courseId } : { _id: req.params.courseId, instructor: req.user.id };
    const course = await Course.findOneAndUpdate(filter, data, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ error: "Course not found or you do not own it." });
    res.json({ course });
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});

router.post("/:courseId/enroll", requireAuth, allowRoles("student"), async (req, res, next) => {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, published: true });
    if (!course) return res.status(404).json({ error: "Course not found." });
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user.id, course: course.id },
      { $setOnInsert: { student: req.user.id, course: course.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.status(201).json({ enrollment });
  } catch (error) { next(error); }
});

router.post("/:courseId/progress", requireAuth, allowRoles("student"), async (req, res, next) => {
  try {
    const { lessonId } = z.object({ lessonId: z.string().min(1) }).parse(req.body);
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found." });
    const lessonExists = course.modules.some((module) => module.lessons.some((lesson) => String(lesson.id) === lessonId));
    if (!lessonExists) return res.status(404).json({ error: "Lesson not found in this course." });
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user.id, course: course.id },
      { $addToSet: { completedLessons: lessonId } },
      { new: true },
    );
    if (!enrollment) return res.status(403).json({ error: "Enroll in this course before recording progress." });
    res.json({ completedLessons: enrollment.completedLessons });
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});

router.post("/:courseId/quiz/:moduleId/submit", requireAuth, allowRoles("student"), async (req, res, next) => {
  try {
    const { answers } = z.object({ answers: z.array(z.number().int().min(0)).max(50) }).parse(req.body);
    const [course, enrollment] = await Promise.all([
      Course.findById(req.params.courseId),
      Enrollment.findOne({ course: req.params.courseId, student: req.user.id }),
    ]);
    if (!course) return res.status(404).json({ error: "Course not found." });
    if (!enrollment) return res.status(403).json({ error: "Enroll in this course before taking its quiz." });
    const module = course.modules.id(req.params.moduleId);
    if (!module || module.quiz.length === 0) return res.status(404).json({ error: "Quiz not found." });
    const score = module.quiz.reduce((sum, question, index) => sum + (answers[index] === question.answerIndex ? 1 : 0), 0);
    enrollment.quizResults.push({ moduleId: String(module.id), score, total: module.quiz.length });
    await enrollment.save();
    res.json({ score, total: module.quiz.length, results: module.quiz.map((question, index) => ({
      correct: answers[index] === question.answerIndex,
      answerIndex: question.answerIndex,
      explanation: question.explanation,
    })) });
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});

router.post("/:courseId/assignment/:moduleId/:assignmentId/submit", requireAuth, allowRoles("student"), async (req, res, next) => {
  try {
    const { answer } = z.object({ answer: z.string().trim().min(1).max(12000) }).parse(req.body);
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found." });
    const module = course.modules.id(req.params.moduleId);
    const assignment = module?.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ error: "Assignment not found." });
    const enrollment = await Enrollment.findOne({ student: req.user.id, course: course.id });
    if (!enrollment) return res.status(403).json({ error: "Enroll in this course before submitting an assignment." });
    const submission = enrollment.assignmentSubmissions.find((item) => item.assignmentId === String(assignment.id));
    if (submission) {
      submission.answer = answer;
      submission.submittedAt = new Date();
      submission.score = undefined;
      submission.feedback = "";
    } else {
      enrollment.assignmentSubmissions.push({ assignmentId: String(assignment.id), answer });
    }
    await enrollment.save();
    res.status(201).json({ submission: enrollment.assignmentSubmissions.find((item) => item.assignmentId === String(assignment.id)) });
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});

router.get("/:courseId/submissions", requireAuth, allowRoles("admin", "instructor"), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found." });
    if (req.user.role === "instructor" && String(course.instructor) !== req.user.id) {
      return res.status(403).json({ error: "You can only review your own course assignments." });
    }
    const submissions = await Enrollment.find({
      course: course.id,
      "assignmentSubmissions.0": { $exists: true },
    }).populate("student", "name email").select("student assignmentSubmissions");
    res.json({ submissions });
  } catch (error) { next(error); }
});

router.patch("/:courseId/submissions/:studentId/:assignmentId", requireAuth, allowRoles("admin", "instructor"), async (req, res, next) => {
  try {
    const { score, feedback } = z.object({
      score: z.number().min(0).max(1000),
      feedback: z.string().trim().max(2000),
    }).parse(req.body);
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ error: "Course not found." });
    if (req.user.role === "instructor" && String(course.instructor) !== req.user.id) {
      return res.status(403).json({ error: "You can only grade assignments in your own courses." });
    }
    const assignment = course.modules.flatMap((module) => module.assignments)
      .find((item) => String(item.id) === req.params.assignmentId);
    if (!assignment) return res.status(404).json({ error: "Assignment not found." });
    if (score > assignment.maxScore) return res.status(400).json({ error: `Score cannot exceed ${assignment.maxScore}.` });
    const enrollment = await Enrollment.findOne({ course: course.id, student: req.params.studentId });
    const submission = enrollment?.assignmentSubmissions.find((item) => item.assignmentId === req.params.assignmentId);
    if (!submission) return res.status(404).json({ error: "Assignment submission not found." });
    submission.score = score;
    submission.feedback = feedback;
    await enrollment.save();
    res.json({ submission });
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});

export default router;
