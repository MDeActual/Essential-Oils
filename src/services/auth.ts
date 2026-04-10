import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../config/env";
import { Role } from "../types";

const JWT_ALGORITHM: jwt.Algorithm = "HS256";
const JWT_SECRET: jwt.Secret = env.JWT_SECRET;

export function signToken(payload: { sub: string; role: Role; contributorId?: string }) {
  const options = { expiresIn: env.JWT_EXPIRES_IN, algorithm: JWT_ALGORITHM } as jwt.SignOptions;
  return jwt.sign(payload as jwt.JwtPayload, JWT_SECRET, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] }) as {
    sub: string;
    role: Role;
    contributorId?: string;
  };
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function requireRole(required: Role | Role[], userRole: Role) {
  const roles = Array.isArray(required) ? required : [required];
  return roles.includes(userRole);
}
