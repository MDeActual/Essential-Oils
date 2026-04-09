import { v4 as uuid } from "uuid";
import { Challenge, Contributor, OutcomeLog, Protocol } from "../types";

// TODO: Replace with canonical database + persistence layer; this store is scaffold-only.

const contributors: Contributor[] = [
  {
    id: "c-real-001",
    name: "Avery",
    region: "NW-1",
    reputationScore: 0.82,
    dataOrigin: "real_contributor",
  },
  {
    id: "c-synth-001",
    name: "Synthia",
    region: "SIM-1",
    reputationScore: 0.5,
    dataOrigin: "synthetic",
  },
];

const protocols: Protocol[] = [
  {
    id: "p-lavender-calm",
    title: "Lavender Calm Inhalation",
    version: "v1",
    category: "calming",
    recommendedFor: ["stress_relief", "sleep_preparation"],
    steps: [
      {
        order: 1,
        method: "Inhalation via diffuser",
        timing: "Evening, 30 minutes before sleep",
        quantity: "4 drops lavender oil in 200ml water",
        effortLevel: "low",
        safetyNote: "Keep diffuser at low heat; avoid direct skin contact undiluted.",
      },
      {
        order: 2,
        method: "Paced breathing",
        timing: "During inhalation session",
        quantity: "4-6 breaths per minute for 2 minutes",
        effortLevel: "low",
        safetyNote: "Stop if dizziness occurs.",
      },
    ],
  },
  {
    id: "p-ginger-focus",
    title: "Ginger Focus Topical",
    version: "v1",
    category: "focus",
    recommendedFor: ["afternoon_slump"],
    steps: [
      {
        order: 1,
        method: "Topical application (diluted)",
        timing: "Afternoon",
        quantity: "2 drops ginger oil + 10 drops carrier; apply to wrists",
        effortLevel: "low",
        safetyNote: "Do not use undiluted; discontinue if skin irritation occurs.",
      },
      {
        order: 2,
        method: "Short movement",
        timing: "Immediately after application",
        quantity: "5-minute brisk walk",
        effortLevel: "moderate",
        safetyNote: "Skip if dizzy.",
      },
    ],
  },
];

const challenges: Challenge[] = [
  {
    id: "ch-rest-7",
    name: "Rest and Reset (7d)",
    description: "Seven-day calming protocol with daily signal logging.",
    protocolId: "p-lavender-calm",
    durationDays: 7,
  },
  {
    id: "ch-focus-5",
    name: "Focus Boost (5d)",
    description: "Five-day focus protocol with adherence tracking.",
    protocolId: "p-ginger-focus",
    durationDays: 5,
  },
];

const outcomeLogs: OutcomeLog[] = [];

export const store = {
  contributors,
  protocols,
  challenges,
  outcomeLogs,
  addOutcome(log: Omit<OutcomeLog, "id" | "createdAt">) {
    const entry: OutcomeLog = {
      ...log,
      id: uuid(),
      createdAt: new Date().toISOString(),
    };
    outcomeLogs.push(entry);
    return entry;
  },
};
