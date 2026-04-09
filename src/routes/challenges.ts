import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { store } from "../data/store";

const joinSchema = z.object({
  contributorId: z.string(),
});

export const challengesRouter = Router();

challengesRouter.get("/", (_req, res) => {
  res.json({ challenges: store.challenges });
});

challengesRouter.post("/:id/join", (req, res) => {
  if (!env.ENABLE_CHALLENGES) {
    return res.status(503).json({ error: "challenges_disabled" });
  }

  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.format() });
  }

  const challenge = store.challenges.find((c) => c.id === req.params.id);
  if (!challenge) {
    return res.status(404).json({ error: "challenge_not_found" });
  }

  const contributor = store.contributors.find((c) => c.id === parsed.data.contributorId);
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

  return res.json({
    message: "joined",
    challenge,
    protocol: store.protocols.find((p) => p.id === challenge.protocolId),
  });
});
