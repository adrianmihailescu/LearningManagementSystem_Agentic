import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token)
    return res.status(401).json({ error: "Sign in to continue." });
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Your session is invalid or has expired." });
  }
  try {
    const user = await User.findById(payload.sub);
    if (!user)
      return res.status(401).json({ error: "Your account is no longer available." });
    req.user = user;
  } catch (error) {
    return next(error);
  }
  next();
}

export async function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token)
    return next();
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Your session is invalid or has expired." });
  }
  try {
    req.user = await User.findById(payload.sub);
    if (!req.user) return res.status(401).json({ error: "Your account is no longer available." });
    next();
  } catch (error) {
    next(error);
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ error: "You do not have permission to perform this action." });
    next();
  };
}
