/**
 * analytics.ts — Analytics Route Definitions
 *
 * Mounts the read-only analytics endpoints on the provided Express Router:
 *   GET /analytics/protocols       — per-protocol cohort summaries
 *   GET /analytics/protocols/:id   — cohort detail for a single protocol
 *
 * The :id parameter is validated before reaching the controller via the
 * validateId middleware. All LOCK-003 enforcement happens inside the analytics
 * pipeline (runProtocolSegmentPipeline), not in the route layer.
 */

import { Router } from "express";
import {
  createAnalyticsController,
} from "../controllers/analyticsController";
import { validateId } from "../middleware/validateId";
import { AnalyticsService } from "../services/analyticsService";

export function createAnalyticsRouter(analyticsService: AnalyticsService): Router {
  const router = Router();
  const controller = createAnalyticsController(analyticsService);

/** GET /analytics/protocols — per-protocol cohort summaries. */
  router.get("/protocols", controller.listAnalyticsProtocols);

/** GET /analytics/protocols/:id — cohort detail for a single protocol. */
  router.get("/protocols/:id", validateId, controller.getAnalyticsProtocol);

  return router;
}
