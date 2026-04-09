import { env } from "../config/env";
import { OutcomeLog } from "../types";

export type EligibilityResult =
  | { allowed: true; weight: number }
  | { allowed: false; reason: string };

export function canUseForDiscovery(origin: OutcomeLog["dataOrigin"]): boolean {
  if (origin === "real_contributor") return true;
  if (!env.ENABLE_SYNTHETIC_DATA) return false;
  return origin === "synthetic" || origin === "internal_test";
}

export function adherenceWeight(adherence: number): EligibilityResult {
  if (adherence < env.MIN_ADHERENCE_FOR_VALID_RUN) {
    return { allowed: false, reason: "adherence_below_minimum" };
  }
  if (adherence < env.FULL_WEIGHT_ADHERENCE_THRESHOLD) {
    return { allowed: true, weight: 0.5 };
  }
  return { allowed: true, weight: 1 };
}

export function reputationWeight(reputation?: number): number {
  if (!env.ENABLE_REPUTATION_WEIGHTING || reputation === undefined) return 1;
  if (reputation >= 0.8) return 1.2;
  if (reputation >= 0.6) return 1;
  if (reputation >= 0.4) return 0.8;
  return 0.5;
}
