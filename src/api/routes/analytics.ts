/**
 * analytics.ts — Analytics Route Definitions
 *
 * Analytics reads require a verified principal, explicit matching tenant
 * context, and the `analytics.read` permission whenever OIDC mode is enabled.
 * LOCK-003 data-origin enforcement remains inside the analytics pipeline.
 */

import { Router } from "express";
import {
  getAnalyticsProtocol,
  listAnalyticsProtocols,
} from "../controllers/analyticsController";
import { validateId } from "../middleware/validateId";
import { protectedReadBoundary } from "../security/middleware";

const router = Router();
const analyticsRead = protectedReadBoundary("analytics.read");

router.get("/protocols", ...analyticsRead, listAnalyticsProtocols);
router.get("/protocols/:id", ...analyticsRead, validateId, getAnalyticsProtocol);

export default router;
