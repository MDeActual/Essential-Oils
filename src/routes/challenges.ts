import { Request, Response, Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { challengeRepository } from "../repositories/challengeRepository";
import { contributorRepository } from "../repositories/contributorRepository";

const joinSchema = z.object({
  contributorId: z.string(),
});

export const challengesRouter = Router();

challengesRouter.get("/", async (_req: Request, res: Response) => {
  const challenges = await challengeRepository.list();
  res.json({ challenges });
});

challengesRouter.post("/:id/join", async (req: Request, res: Response) => {
  if (!env.ENABLE_CHALLENGES) {
    return res.status(503).json({ error: "challenges_disabled" });
  }

  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.format() });
  }

  const challengeId = req.params.id as string;
  const challenge = await challengeRepository.getById(challengeId);
  if (!challenge) {
    return res.status(404).json({ error: "challenge_not_found" });
  }

  const contributor = await contributorRepository.getById(parsed.data.contributorId);
  if (!contributor) {
    return res.status(404).json({ error: "contributor_not_found" });
  }

  if (!env.ENABLE_SYNTHETIC_DATA && contributor.dataOrigin !== "real_contributor") {
    return res.status(403).json({ error: "synthetic_disabled" });
  }

  // eslint-disable-next-line no-console
  console.info("challenge_join", {
    challengeId: challenge.id,
    contributorId: contributor.id,
    dataOrigin: contributor.dataOrigin,
  });

  await challengeRepository.addParticipant(challenge.id, contributor.id);

  return res.json({
    message: "joined",
    challenge,
    protocol: challenge.protocol,
  });
});
