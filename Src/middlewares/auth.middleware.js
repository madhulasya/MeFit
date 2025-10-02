// JWT authentication middleware
import { verifyToken } from "../configs/jwt.config.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authorization token required" });

    const decoded = verifyToken(token);
    if (!decoded) return res.status(401).json({ message: "Invalid or expired token" });

    req.user = decoded; // { id, email, roles? }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const roles = req.user?.roles || [];
    const ok = roles.some((r) => allowedRoles.includes(r));
    if (!ok) return res.status(403).json({ message: "Forbidden" });
    next();
  };
};