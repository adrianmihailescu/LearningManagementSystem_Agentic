import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  type: { type: String, enum: ["multiple-choice", "true-false"], default: "multiple-choice" },
  options: [{ type: String }],
  answerIndex: { type: Number, required: true },
  explanation: { type: String, default: "" },
});
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["text", "video", "code", "file"], default: "text" },
  content: { type: String, default: "" },
  durationMinutes: { type: Number, default: 10, min: 1 },
  resourceUrl: { type: String, default: "" },
  codeExample: { type: String, default: "" },
});
const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  instructions: { type: String, required: true },
  maxScore: { type: Number, default: 100, min: 1, max: 1000 },
});
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lessons: [lessonSchema],
  quiz: [questionSchema],
  assignments: [assignmentSchema],
});
const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, maxlength: 3000 },
  category: { type: String, required: true, trim: true },
  level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
  coverColor: { type: String, default: "#6338d5" },
  tags: [String],
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  modules: [moduleSchema],
  published: { type: Boolean, default: true },
}, { timestamps: true });
courseSchema.index({ title: "text", description: "text", category: "text", tags: "text" });

export default mongoose.model("Course", courseSchema);
