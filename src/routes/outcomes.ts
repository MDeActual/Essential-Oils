import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { store } from "../data/store";
import { adherenceWeight, canUseForDiscovery, reputationWeight } from "../services/eligibility";

const outcomeSchema = z.object({
  contributorId: z.string(),
  challengeId: z.string(),
  protocolId: z.string(),
  adherence: z.number().min(0).max(100),
  signals: z.record(z.string(), z.union([z.string(), z.number()])),
  dataOrigin: z.enum(["real_contributor", "synthetic", "internal_test"]),
});

export const outcomesRouter = Router();

outcomesRouter.post("/", (req, res) => {
  const parsed = outcomeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_request", details: parsed.error.format() });
  }

  const { contributorId, challengeId, protocolId, adherence, signals, dataOrigin } = parsed.data;

  const contributor = store.contributors.find((c) => c.id === contributorId);
  if (!contributor) {
    return res.status(404).json({ error: "contributor_not_found" });
  }

  if (!env.ENABLE_SYNTHETIC_DATA && dataOrigin !== "real_contributor") {
    return res.status(403).json({ error: "synthetic_disabled" });
  }

  const challenge = store.challenges.find((c) => c.id === challengeId);
  if (!challenge) {
    return res.status(404).json({ error: "challenge_not_found" });
  }

  const protocol = store.protocols.find((p) => p.id === protocolId);
  if (!protocol) {
    return res.status(404).json({ error: "protocol_not_found" });
  }

  const adherenceResult = adherenceWeight(adherence);
  if (!adherenceResult.allowed) {
    return res.status(422).json({ error: adherenceResult.reason });
  }

  const log = store.addOutcome({
    contributorId,
    challengeId,
    protocolId,
    adherence,
    signals,
    dataOrigin,
  });

  const reputation = reputationWeight(contributor.reputationScore);
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
