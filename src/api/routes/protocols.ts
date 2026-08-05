/**
 * protocols.ts — Protocol Route Definitions
 *
 * Protocol reads require a verified principal, explicit matching tenant
 * context, and the `protocols.read` permission whenever OIDC mode is enabled.
 */

import { Router } from "express";
import { getProtocol, listProtocols } from "../controllers/protocolController";
import { validateId } from "../middleware/validateId";
import { protectedReadBoundary } from "../security/middleware";

const router = Router();
const protocolRead = protectedReadBoundary("protocols.read");

router.get("/", ...protocolRead, listProtocols);
router.get("/:id", ...protocolRead, validateId, getProtocol);

export default router;
