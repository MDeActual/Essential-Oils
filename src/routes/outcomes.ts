import { Request, Response, Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { contributorRepository } from "../repositories/contributorRepository";
import { challengeRepository } from "../repositories/challengeRepository";
import { protocolRepository } from "../repositories/protocolRepository";
import { outcomeRepository } from "../repositories/outcomeRepository";
import { adherenceWeight, canUseForDiscovery, reputationWeight } from "../services/eligibility";

const outcomeSchema = z.object({
  contributorId: z.string(),
  challengeId: z.string(),
  protocolId: z.string(),
  adherence: z.number().min(0).max(100),
  signals: z.record(z.string(), z.union([z.string(), z.number()])),
});

export const outcomesRouter = Router();

outcomesRouter.post("/", async (req: Request, res: Response) => {
  const parsed = outcomeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.format() });
  }

  const { contributorId, challengeId, protocolId, adherence, signals } = parsed.data;

  const contributor = await contributorRepository.getById(contributorId);
  if (!contributor) {
    return res.status(404).json({ error: "contributor_not_found" });
  }

  const dataOrigin = contributor.dataOrigin;

  if (!env.ENABLE_SYNTHETIC_DATA && dataOrigin !== "real_contributor") {
    return res.status(403).json({ error: "synthetic_disabled" });
  }

  const challenge = await challengeRepository.getById(challengeId);
  if (!challenge) {
    return res.status(404).json({ error: "challenge_not_found" });
  }

  const protocol = await protocolRepository.getById(protocolId);
  if (!protocol) {
    return res.status(404).json({ error: "protocol_not_found" });
  }

  if (challenge.protocolId !== protocol.id) {
    return res.status(422).json({ error: "protocol_mismatch_for_challenge" });
  }

  const adherenceResult = adherenceWeight(adherence);
  if (!adherenceResult.allowed) {
    return res.status(422).json({ error: adherenceResult.reason });
  }

  const log = await outcomeRepository.create({
    contributorId,
    challengeId,
    protocolId,
    adherence,
    signals,
    dataOrigin,
  });

  const reputation = reputationWeight(contributor.reputationScore ?? undefined);
  const discoveryEligible =
    dataOrigin === "real_contributor" ||
    (env.ENABLE_SYNTHETIC_DATA && canUseForDiscovery(dataOrigin));

  const scoringWeight = adherenceResult.weight * reputation;

  // eslint-disable-next-line no-console
  console.info("outcome_recorded", {
    logId: log.id,
    contributorId,
    challengeId,
    protocolId,
    discoveryEligible,
    scoringWeight,
  });

  return res.json({
    outcomeId: log.id,
    discoveryEligible,
    scoringWeight,
    adherenceWeight: adherenceResult.weight,
    reputationWeight: reputation,
  });
});
