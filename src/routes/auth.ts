import { Request, Response, Router } from "express";
import { z } from "zod";
import { comparePassword, hashPassword, signToken } from "../services/auth";
import { contributorRepository } from "../repositories/contributorRepository";
import { userRepository } from "../repositories/userRepository";
import { DataOrigin, Role } from "../types";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["contributor", "practitioner", "researcher", "admin"]),
  name: z.string().optional(),
  region: z.string().optional(),
  dataOrigin: z.enum(["real_contributor", "synthetic", "internal_test"]).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRouter = Router();

authRouter.post("/register", async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.format() });
  }
  const { email, password, role, name, region, dataOrigin } = parsed.data;

  const existing = await userRepository.getByEmail(email);
  if (existing) return res.status(409).json({ error: "email_in_use" });

  let contributorId: string | undefined;
  if (role === "contributor") {
    const origin: DataOrigin = dataOrigin ?? "real_contributor";
    const contributor = await contributorRepository.create({
      name: name ?? "Contributor",
      ...(region ? { region } : {}),
      dataOrigin: origin,
      reputationScore: 0.5,
    });
    contributorId = contributor.id;
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.create({
    email,
    passwordHash,
    role: role as Role,
    ...(contributorId ? { contributorId } : {}),
  });
  const token = signToken({
    sub: user.id,
    role: user.role,
    ...(contributorId ? { contributorId } : {}),
  });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, contributorId } });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.format() });
  }
  const { email, password } = parsed.data;
  const user = await userRepository.getByEmail(email);
  if (!user) return res.status(401).json({ error: "invalid_credentials" });

  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "invalid_credentials" });

  const token = signToken({
    sub: user.id,
    role: user.role as Role,
    ...(user.contributorId ? { contributorId: user.contributorId } : {}),
  });
  return res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, contributorId: user.contributorId },
  });
});
