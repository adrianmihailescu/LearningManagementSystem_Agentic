import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Course from "./models/Course.js";

if (!process.env.JWT_SECRET) console.warn("JWT_SECRET is not needed for seeding, but is required to start the API.");
await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/smartlearning");

const demoUsers = [
  { name: "Alex Morgan", email: "admin@smartlearning.local", role: "admin" },
  { name: "Jordan Lee", email: "instructor@smartlearning.local", role: "instructor" },
  { name: "Taylor Kim", email: "student@smartlearning.local", role: "student" },
];
const users = {};
for (const item of demoUsers) {
  let user = await User.findOne({ email: item.email }).select("+password");
  if (!user) user = new User({ email: item.email });
  user.name = item.name;
  user.role = item.role;
  user.password = "SmartLearn123!";
  users[item.role] = await user.save();
}

const sampleCourses = [
  {
    title: "Introduction to Machine Learning",
    description: "Learn the foundations of machine learning, explore practical algorithms, and build your first predictive model.",
    category: "Data Science", level: "Beginner", coverColor: "#4b68dc", tags: ["Python", "ML", "Data Science"],
    instructor: users.instructor.id, published: true,
    modules: [{ title: "Start with the fundamentals", lessons: [
      { title: "What is machine learning?", type: "text", durationMinutes: 12, content: "Machine learning is a field of computing where models learn patterns from examples to make predictions. Supervised learning uses labeled examples; unsupervised learning looks for structure without labels." },
      { title: "Your first model", type: "code", durationMinutes: 18, content: "A model maps input features to a prediction. Start with a simple baseline, split data into training and test sets, then compare predictions with known outcomes.", codeExample: "from sklearn.linear_model import LinearRegression\\nmodel = LinearRegression().fit(X_train, y_train)\\npredictions = model.predict(X_test)" },
    ], quiz: [{ prompt: "What is the purpose of a test set?", options: ["To evaluate how well a model generalizes", "To increase the number of features", "To store model settings"], answerIndex: 0, explanation: "A separate test set estimates performance on data the model did not train on." }] }],
  },
  {
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into closures, prototypes, asynchronous patterns, and the language features behind modern web applications.",
    category: "Web Development", level: "Advanced", coverColor: "#b87525", tags: ["JavaScript", "Web", "Programming"],
    instructor: users.instructor.id, published: true,
    modules: [{ title: "Functions and asynchronous JavaScript", lessons: [
      { title: "Closures in practice", type: "code", durationMinutes: 15, content: "A closure is a function together with references to its surrounding lexical environment. Closures let functions retain access to variables after the outer function has returned.", codeExample: "function createCounter() {\\n  let count = 0;\\n  return () => ++count;\\n}" },
      { title: "Promises and async/await", type: "text", durationMinutes: 20, content: "Promises represent the eventual completion or failure of an asynchronous operation. Async functions make promise-based control flow easier to read." },
    ], quiz: [{ prompt: "What does a closure retain?", options: ["Access to its lexical environment", "A copy of every global variable", "Only the function's return value"], answerIndex: 0, explanation: "Closures retain references to variables in the surrounding lexical scope." }] }],
  },
  {
    title: "UX Design Principles",
    description: "Master practical user experience principles and create intuitive interfaces through research, structure, and iteration.",
    category: "Design", level: "Intermediate", coverColor: "#168a83", tags: ["UX", "Design", "UI"],
    instructor: users.instructor.id, published: true,
    modules: [{ title: "Designing for people", lessons: [
      { title: "Start with user needs", type: "text", durationMinutes: 10, content: "Good UX begins with understanding users' goals, constraints, and context. Research findings should inform the problem definition before choosing a solution." },
      { title: "Make interfaces understandable", type: "text", durationMinutes: 14, content: "Clear hierarchy, consistent language, and timely feedback help people understand what they can do and what happened after an action." },
    ], quiz: [] }],
  },
];
for (const course of sampleCourses) {
  await Course.findOneAndUpdate({ title: course.title }, { $set: course }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
console.log("Seed complete. Demo password: SmartLearn123!");
await mongoose.disconnect();
