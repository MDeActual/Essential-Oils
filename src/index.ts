/**
 * index.ts — Server Entry Point
 *
 * Loads environment variables, validates the runtime/storage contract, and
 * starts the API only when configuration is safe. Credential values are never
 * included in startup diagnostics.
 */

import "dotenv/config";
import { createApp } from "./api";
import { loadRuntimeConfig, safeRuntimeDiagnostics } from "./config/runtime";

const runtimeConfig = loadRuntimeConfig(process.env);
const app = createApp(runtimeConfig);

app.listen(runtimeConfig.port, () => {
  console.log("Phyto.ai API started", safeRuntimeDiagnostics(runtimeConfig));
});
