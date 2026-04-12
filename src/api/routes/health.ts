/**
 * health.ts — Health Route Definitions
 *
 * Mounts GET /health on the provided Express Router. The route is stateless
 * and dependency-free; it serves as a reliable liveness probe.
 */

import { Router } from "express";
import { getHealth } from "../controllers/healthController";

const router = Router();

/** GET /health — liveness probe. */
router.get("/", getHealth);

export default router;
