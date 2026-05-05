/**
 * protocols.ts — Protocol Route Definitions
 *
 * Mounts the read-only protocol endpoints on the provided Express Router:
 *   GET /protocols       — list all protocol summaries
 *   GET /protocols/:id   — get detail for a single protocol
 *
 * The :id parameter is validated before reaching the controller via the
 * validateId middleware to prevent malformed identifiers from propagating.
 */

import { Router } from "express";
import {
  createProtocolController,
} from "../controllers/protocolController";
import { validateId } from "../middleware/validateId";
import { ProtocolService } from "../services/protocolService";

export function createProtocolsRouter(protocolService: ProtocolService): Router {
  const router = Router();
  const controller = createProtocolController(protocolService);

  /** GET /protocols — list all protocol summaries. */
  router.get("/", controller.listProtocols);

  /** GET /protocols/:id — get a single protocol by id. */
  router.get("/:id", validateId, controller.getProtocol);

  return router;
}
