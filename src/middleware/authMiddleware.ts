import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../services/auth";
import { Role } from "../types";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: Role; contributorId?: string };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "unauthorized" });
  const token = header.substring("Bearer ".length);
  try {
    const payload = verifyToken(token);
    req.user = payload.contributorId
      ? { id: payload.sub, role: payload.role, contributorId: payload.contributorId }
      : { id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "unauthorized" });
  }
}

export function requireRoles(roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "unauthorized" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "forbidden" });
    next();
  };
}
