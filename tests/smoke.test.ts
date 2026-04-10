import { evaluateAdherence, generateProtocolSteps } from "../src/services/protocol-engine/engine";
import { reputationWeight, adherenceWeight } from "../src/services/eligibility";

async function run() {
  const steps = await generateProtocolSteps({ category: "calming", target: "sleep" });
  if (!steps.length) throw new Error("Protocol steps generation failed");

  const adherence = adherenceWeight(80);
  if (!adherence.allowed || adherence.weight <= 0) throw new Error("Adherence weight invalid");

  const rep = reputationWeight(0.75);
  if (rep <= 0) throw new Error("Reputation weight invalid");

  const evalResult = await evaluateAdherence(85);
  if (evalResult.weight <= 0) throw new Error("Adherence evaluation invalid");
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
