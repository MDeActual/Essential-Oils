const { cpSync, existsSync, mkdirSync, rmSync } = require("node:fs");
const { dirname, resolve } = require("node:path");

const source = resolve("src/generated/prisma");
const target = resolve("dist/generated/prisma");

if (!existsSync(source)) {
  throw new Error(
    "Generated Prisma client is missing. Run `prisma generate` before packaging the build."
  );
}

mkdirSync(dirname(target), { recursive: true });
rmSync(target, { recursive: true, force: true });
cpSync(source, target, { recursive: true });

console.log(`Copied generated Prisma client to ${target}`);
