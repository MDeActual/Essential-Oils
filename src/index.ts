/**
 * index.ts — Server Entry Point
 *
 * Starts the Phyto.ai API server on the port specified by the PORT environment
 * variable (default: 3000). Loads .env via dotenv so DATABASE_URL is available
 * to the Prisma client when running locally.
 *
 * Usage:
 *   npm start          (compiled — runs dist/index.js)
 *   npm run dev        (ts-node — runs src/index.ts directly)
 */

import "dotenv/config";
import { createApp } from "./api";

const PORT = parseInt(process.env["PORT"] ?? "3000", 10);

const app = createApp();

app.listen(PORT, () => {
  console.log(`Phyto.ai API running at http://localhost:${PORT}`);
});
