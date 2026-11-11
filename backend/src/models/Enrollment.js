import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  completedLessons: [{ type: String }],
  quizResults: [{
    moduleId: String,
    score: Number,
    total: Number,
    submittedAt: { type: Date, default: Date.now },
  }],
  assignmentSubmissions: [{
    assignmentId: { type: String, required: true },
    answer: { type: String, required: true, maxlength: 12000 },
    submittedAt: { type: Date, default: Date.now },
    score: { type: Number, min: 0, max: 1000 },
    feedback: { type: String, maxlength: 2000, default: "" },
  }],
  enrolledAt: { type: Date, default: Date.now },
}, { timestamps: true });
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model("Enrollment", enrollmentSchema);
