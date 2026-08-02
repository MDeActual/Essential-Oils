const { spawnSync } = require("node:child_process");

function run(command, args, label) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    console.error(`${label} failed to start:`, result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`${label} exited with status ${result.status ?? "unknown"}.`);
    process.exit(result.status ?? 1);
  }
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

run(npx, ["prisma", "generate"], "Prisma client generation");
run(npx, ["ts-node", "prisma/seed.ts"], "Prisma seed script");
