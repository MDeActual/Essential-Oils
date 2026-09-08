/**
 * engine.ts — Internal Challenge Engine Rule Evaluation
 *
 * This module implements the moat-protected challenge engine behavior described
 * in docs/challenge_engine_specification.md. The public challenge module keeps
 * this logic internal and does not re-export rule evaluation functions.
 *
 * The logic intentionally covers the public contract only: selection,
 * sequencing, timeliness, completion integrity, and adherence contribution.
 * The proprietary assessment heuristics remain internal to this module.
 */

import { CHALLENGE_RESPONSE_MAX_LENGTH } from "./schema";
import type { ChallengeCompletionRecord } from "./types";
import { validateChallengeCompletionRecordCollection } from "./validation";
import { ChallengeCompletionStatus, ChallengeType } from "../protocol/types";
import type { Challenge } from "../protocol/types";

export type ChallengeEngineRuleCode =
  | "CE-001"
  | "CE-002"
  | "CE-003"
  | "CE-004"
  | "CE-005"
  | "CE-006"
  | "CE-007";

export interface ChallengeEngineIssue {
  code: ChallengeEngineRuleCode;
  challengeId?: string;
  field?: string;
  message: string;
}

export interface ChallengeRuleContext {
  challenges: Challenge[];
  completionRecords?: ChallengeCompletionRecord[];
  phaseIndex?: number;
  protocolId?: string;
  userId?: string;
  protocolStartAt?: string;
}

export interface ChallengeEngineResult {
  valid: boolean;
  issues: ChallengeEngineIssue[];
  activeAdherenceChallenges: Challenge[];
  eligibleChallenges: Challenge[];
  adherenceContribution: number;
}

export interface ChallengeTimelinessResult {
  valid: boolean;
  wasTimely: boolean;
  issues: ChallengeEngineIssue[];
}

export function listChallengeEngineRules(): ChallengeEngineRuleCode[] {
  return ["CE-001", "CE-002", "CE-003", "CE-004", "CE-005", "CE-006", "CE-007"];
}

export function isChallengeTerminal(status: ChallengeCompletionStatus): boolean {
  return (
    status === ChallengeCompletionStatus.Completed ||
    status === ChallengeCompletionStatus.Skipped
  );
}

function calculateChallengeAdherenceContribution(
  completion: Pick<ChallengeCompletionRecord, "finalStatus" | "wasTimely">
): number {
  switch (completion.finalStatus) {
    case ChallengeCompletionStatus.Completed:
      return completion.wasTimely ? 1 : 0.5;
    case ChallengeCompletionStatus.Skipped:
      return 0;
    default:
      return 0;
  }
}

function sumChallengeAdherenceContribution(
  completionRecords: ChallengeCompletionRecord[] = []
): number {
  return completionRecords.reduce(
    (total, record) => total + calculateChallengeAdherenceContribution(record),
    0
  );
}

export function evaluateChallengeTimeliness(
  challenge: Pick<Challenge, "challengeId" | "dueDay" | "completionStatus" | "response">,
  completedAt?: string,
  protocolStartAt?: string
): ChallengeTimelinessResult {
  const issues: ChallengeEngineIssue[] = [];

  if (!Number.isInteger(challenge.dueDay) || challenge.dueDay < 1) {
    issues.push({
      code: "CE-002",
      challengeId: challenge.challengeId,
      field: "dueDay",
      message: "Challenge dueDay must be a positive integer.",
    });
  }

  if (
    challenge.completionStatus === ChallengeCompletionStatus.Completed &&
    (!challenge.response || challenge.response.trim().length === 0)
  ) {
    issues.push({
      code: "CE-003",
      challengeId: challenge.challengeId,
      field: "response",
      message: "Completed challenges require a non-empty response.",
    });
  }

  if (!completedAt || !challenge.dueDay || !Number.isInteger(challenge.dueDay)) {
    return {
      valid: issues.length === 0,
      wasTimely: false,
      issues,
    };
  }

  if (!protocolStartAt) {
    issues.push({
      code: "CE-002",
      challengeId: challenge.challengeId,
      field: "protocolStartAt",
      message: "A protocol start timestamp is required to compute due-day timeliness.",
    });
    return {
      valid: false,
      wasTimely: false,
      issues,
    };
  }

  const protocolStartDate = new Date(protocolStartAt);
  if (Number.isNaN(protocolStartDate.getTime())) {
    issues.push({
      code: "CE-002",
      challengeId: challenge.challengeId,
      field: "protocolStartAt",
      message: "Protocol start timestamp must be a valid ISO 8601 date.",
    });
    return {
      valid: false,
      wasTimely: false,
      issues,
    };
  }

  const dueDate = new Date(protocolStartDate);
  dueDate.setUTCDate(protocolStartDate.getUTCDate() + Math.max(0, challenge.dueDay - 1));
  dueDate.setUTCHours(23, 59, 59, 999);

  const completedAtDate = new Date(completedAt);
  const wasTimely = Number.isFinite(completedAtDate.getTime())
    ? completedAtDate.getTime() <= dueDate.getTime()
    : false;

  if (Number.isFinite(completedAtDate.getTime()) && !wasTimely) {
    issues.push({
      code: "CE-002",
      challengeId: challenge.challengeId,
      field: "completedAt",
      message: "Challenge was completed after its due day and is not timely.",
    });
  }

  return {
    valid: issues.length === 0,
    wasTimely,
    issues,
  };
}

export function validateTerminalChallengeState(
  challenges: Challenge[]
): ChallengeEngineIssue[] {
  const issues: ChallengeEngineIssue[] = [];

  for (const challenge of challenges) {
    if (isChallengeTerminal(challenge.completionStatus)) {
      const response = challenge.response ?? "";
      if (challenge.completionStatus === ChallengeCompletionStatus.Completed) {
        if (response.trim().length === 0) {
          issues.push({
            code: "CE-007",
            challengeId: challenge.challengeId,
            field: "response",
            message: "Terminal completed challenges must not be retriggered without a non-empty response.",
          });
        }
      }
      if (challenge.completionStatus === ChallengeCompletionStatus.Skipped) {
        if (response.trim().length > 0) {
          issues.push({
            code: "CE-007",
            challengeId: challenge.challengeId,
            field: "response",
            message: "Terminal skipped challenges must not revert to a non-terminal state or carry a response.",
          });
        }
      }
    }
  }

  return issues;
}

export function evaluateChallengeRules(
  context: ChallengeRuleContext
): ChallengeEngineResult {
  const issues: ChallengeEngineIssue[] = [];
  const { challenges, completionRecords = [] } = context;

  const activeAdherenceChallenges = challenges.filter(
    (challenge) =>
      challenge.type === ChallengeType.Adherence &&
      challenge.completionStatus === ChallengeCompletionStatus.Pending
  );

  if (activeAdherenceChallenges.length > 1) {
    issues.push({
      code: "CE-001",
      message: "Only one adherence challenge may be active at a time in a protocol phase.",
    });
  }

  const adherenceChallenges = challenges.filter(
    (challenge) => challenge.type === ChallengeType.Adherence
  );

  if (adherenceChallenges.length === 0) {
    issues.push({
      code: "CE-005",
      message: "A valid protocol must include at least one adherence challenge.",
    });
  }

  for (const challenge of challenges) {
    if (
      challenge.completionStatus === ChallengeCompletionStatus.Completed &&
      (!challenge.response || challenge.response.trim().length === 0)
    ) {
      issues.push({
        code: "CE-003",
        challengeId: challenge.challengeId,
        field: "response",
        message: "Completed challenges require a non-empty response.",
      });
    }

    if (
      challenge.completionStatus === ChallengeCompletionStatus.Skipped &&
      challenge.response && challenge.response.trim().length > 0
    ) {
      issues.push({
        code: "CE-003",
        challengeId: challenge.challengeId,
        field: "response",
        message: "Skipped challenges may not carry a response payload.",
      });
    }

    const completionRecord = completionRecords.find(
      (record) => record.challengeId === challenge.challengeId
    );
    const timeliness = evaluateChallengeTimeliness(
      challenge,
      completionRecord?.completedAt,
      context.protocolStartAt
    );
    if (!timeliness.valid) {
      issues.push(...timeliness.issues);
    }

    if (challenge.response && challenge.response.length > CHALLENGE_RESPONSE_MAX_LENGTH) {
      issues.push({
        code: "CE-006",
        challengeId: challenge.challengeId,
        field: "response",
        message: `Response length exceeds the maximum of ${CHALLENGE_RESPONSE_MAX_LENGTH} characters.`,
      });
    }
  }

  const completionValidation = validateChallengeCompletionRecordCollection(completionRecords);
  issues.push(
    ...completionValidation.errors.map((error) => ({
      code:
        (error.field === "response" || error.field === "skipReason") &&
        error.message.includes("exceed")
          ? ("CE-006" as const)
          : ("CE-003" as const),
      challengeId: completionRecords.find((record) => record.recordId === error.recordId)
        ?.challengeId,
      field: error.field,
      message: error.message,
    }))
  );

  const transitionIssues = validateTerminalChallengeState(challenges);
  issues.push(...transitionIssues);

  const eligibleChallenges = challenges.filter((challenge) => {
    if (challenge.type === ChallengeType.Adherence) {
      return challenge.completionStatus === ChallengeCompletionStatus.Pending;
    }
    return challenge.completionStatus === ChallengeCompletionStatus.Pending;
  });

  const adherenceContribution = sumChallengeAdherenceContribution(completionRecords);

  const result: ChallengeEngineResult = {
    valid: issues.length === 0,
    issues,
    activeAdherenceChallenges,
    eligibleChallenges,
    adherenceContribution,
  };

  return result;
}

export function ensureChallengeSetIntegrity(
  context: ChallengeRuleContext
): ChallengeEngineResult {
  return evaluateChallengeRules(context);
}

export function canPresentChallenge(
  challenge: Pick<Challenge, "type" | "completionStatus" | "response" | "dueDay" | "challengeId">,
  pendingChallenges: Challenge[] = []
): boolean {
  const activeAdherenceCount = pendingChallenges.filter(
    (candidate) =>
      candidate.type === ChallengeType.Adherence &&
      candidate.completionStatus === ChallengeCompletionStatus.Pending
  ).length;

  if (
    challenge.type === ChallengeType.Adherence &&
    challenge.completionStatus === ChallengeCompletionStatus.Pending &&
    activeAdherenceCount >= 1
  ) {
    return false;
  }

  if (
    challenge.completionStatus === ChallengeCompletionStatus.Completed &&
    (!challenge.response || challenge.response.trim().length === 0)
  ) {
    return false;
  }

  if (!Number.isInteger(challenge.dueDay) || challenge.dueDay < 1) {
    return false;
  }

  return true;
}

export function buildChallengeQueue(
  challenges: Challenge[] = []
): Challenge[] {
  return [...challenges].sort((left, right) => {
    if (left.type !== right.type) {
      const priority: Record<string, number> = {
        [ChallengeType.Adherence]: 0,
        [ChallengeType.Educational]: 1,
        [ChallengeType.Experiential]: 2,
      };
      return priority[left.type] - priority[right.type];
    }
    return left.dueDay - right.dueDay;
  });
}
