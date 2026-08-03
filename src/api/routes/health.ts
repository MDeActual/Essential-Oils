/**
 * health.ts — Liveness and readiness routes
 */

import { Router } from "express";
import { getHealth, getReadiness } from "../controllers/healthController";

const router = Router();

router.get("/", getHealth);
router.get("/ready", (req, res, next) => {
  getReadiness(req, res).catch(next);
});

export default router;
