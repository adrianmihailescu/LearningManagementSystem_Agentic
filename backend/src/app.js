import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import userRoutes from "./routes/users.js";
import aiRoutes from "./routes/ai.js";

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/api/ai", rateLimit({ windowMs: 60_000, limit: 20 }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.name === "CastError") return res.status(400).json({ error: "An identifier in the request is invalid." });
  if (error.name === "ValidationError") return res.status(400).json({ error: error.message });
  if (error.code === 11000) return res.status(409).json({ error: "A record with that value already exists." });
  res.status(error.status || 500).json({ error: error.status ? error.message : "An unexpected server error occurred." });
});

export default app;
