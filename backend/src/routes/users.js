import { Router } from "express";
import { z } from "zod";
import User from "../models/User.js";
import { allowRoles, requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/", requireAuth, allowRoles("admin"), async (_req, res, next) => {
  try {
    const users = await User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(500);
    res.json({ users });
  } catch (error) { next(error); }
});
router.patch("/:userId/role", requireAuth, allowRoles("admin"), async (req, res, next) => {
  try {
    const { role } = z.object({ role: z.enum(["admin", "instructor", "student"]) }).parse(req.body);
    if (req.params.userId === req.user.id && role !== "admin") return res.status(400).json({ error: "You cannot remove your own administrator role." });
    const user = await User.findByIdAndUpdate(req.params.userId, { role }, { new: true }).select("name email role");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ user });
  } catch (error) {
    if (error.name === "ZodError") return res.status(400).json({ error: error.issues[0].message });
    next(error);
  }
});
export default router;
