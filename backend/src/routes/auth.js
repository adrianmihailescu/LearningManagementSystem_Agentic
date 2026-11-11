import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const credentials = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar });
function issueToken(user) {
  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  return { token, user: publicUser(user) };
}

router.post("/register", async (req, res, next) => {
  try {
    const data = credentials.extend({ name: z.string().trim().min(2).max(100) }).parse(req.body);
    const user = await User.create({ ...data, role: "student" });
    res.status(201).json(issueToken(user));
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = credentials.pick({ email: true, password: true }).parse(req.body);
    const user = await User.findOne({ email: data.email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(data.password))) return res.status(401).json({ error: "Email or password is incorrect." });
    res.json(issueToken(user));
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
export default router;
