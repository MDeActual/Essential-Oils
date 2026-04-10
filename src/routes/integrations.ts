import { Response, Router } from "express";
import { AuthenticatedRequest, requireAuth, requireRoles } from "../middleware/authMiddleware";
import { syncHealthAppData } from "../services/integrations/healthApps";
import { ingestWearableData } from "../services/integrations/wearables";
import { importExternalProtocols } from "../services/integrations/protocolImports";

export const integrationsRouter = Router();

integrationsRouter.use(requireAuth, requireRoles(["admin", "practitioner", "researcher"]));

integrationsRouter.post("/health-apps/sync", async (_req: AuthenticatedRequest, res: Response) => {
  const result = await syncHealthAppData();
  res.json(result);
});

integrationsRouter.post("/wearables/ingest", async (_req: AuthenticatedRequest, res: Response) => {
  const result = await ingestWearableData();
  res.json(result);
});

integrationsRouter.post("/protocols/import", async (_req: AuthenticatedRequest, res: Response) => {
  const result = await importExternalProtocols();
  res.json(result);
});
