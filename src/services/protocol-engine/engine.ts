import { ProtocolStep } from "../../types";
import { protocolRepository } from "../../repositories/protocolRepository";
import { outcomeRepository } from "../../repositories/outcomeRepository";

export async function generateProtocolSteps(
  base: { category: string; target: string },
  seed?: ProtocolStep[]
): Promise<ProtocolStep[]> {
  if (seed && seed.length) return seed;
  return [
    {
      order: 1,
      method: "Inhalation via diffuser",
      timing: "Evening, 30 minutes before target window",
      quantity: "4 drops essential oil in 200ml water",
      effortLevel: "low",
      safetyNote: "Avoid direct skin contact undiluted.",
    },
  ];
}

export async function evaluateAdherence(adherence: number) {
  if (adherence >= 90) return { label: "excellent", weight: 1 };
  if (adherence >= 70) return { label: "good", weight: 0.8 };
  if (adherence >= 50) return { label: "low", weight: 0.5 };
  return { label: "insufficient", weight: 0 };
}

export async function evolveProtocolVersion(protocolId: string, steps: ProtocolStep[]) {
  const protocol = await protocolRepository.getById(protocolId);
  if (!protocol) throw new Error("protocol_not_found");
  const nextVersion = `v${parseInt(protocol.version.replace("v", ""), 10) + 1}`;
  return protocolRepository.evolveVersion(protocolId, nextVersion, steps);
}

export async function recordOutcomeAnalytics(input: {
  contributorId: string;
  challengeId: string;
  protocolId: string;
  adherence: number;
  signals: Record<string, string | number>;
  dataOrigin: "real_contributor" | "synthetic" | "internal_test";
}) {
  return outcomeRepository.create(input);
}
