/**
 * protocolController.ts — Protocol Endpoint Controllers
 *
 * Handles:
 *   GET /protocols         — returns summaries of all protocols
 *   GET /protocols/:id     — returns detail for a single protocol
 *
 * Controllers delegate data retrieval to protocolStore and shape of the
 * response to the ApiSuccessResponse envelope. No business logic is duplicated
 * here — validation is performed by the protocol module's validateProtocol().
 *
 * MOAT NOTICE (LOCK-002, M-002, M-003):
 *   - The protocol generation algorithm is not exposed here.
 *   - Challenge engine rules are not exposed here.
 *   - Only structural data (phases, counts, lifecycle status) is returned.
 *   - The full challenge prompt text is withheld from list/detail responses;
 *     only challenge counts are surfaced (M-003).
 */

import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../middleware/errorHandler";
import {
  ApiSuccessResponse,
  ProtocolDetail,
  ProtocolPhaseDetail,
  ProtocolSummary,
} from "../types";
import { getAllProtocols, getProtocolById } from "./protocolStore";

/**
 * GET /protocols
 *
 * Returns a summary list of all Protocol records. Phase-level details and
 * challenge counts are included; moat-protected fields are excluded.
 */
export function listProtocols(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const protocols = getAllProtocols();

    const summaries: ProtocolSummary[] = protocols.map((p) => ({
      protocolId: p.protocolId,
      version: p.version,
      goal: p.goal,
      durationDays: p.durationDays,
      status: p.status,
      phaseCount: p.phases.length,
      createdAt: p.createdAt,
    }));

    const body: ApiSuccessResponse<ProtocolSummary[]> = {
      success: true,
      data: summaries,
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /protocols/:id
 *
 * Returns full structural detail for a single Protocol. Only the prompt text
 * and structural metadata of Challenges are surfaced — engine rule internals
 * are withheld (LOCK-002, M-003).
 */
export function getProtocol(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const id = req.params["id"] as string;
    const protocol = getProtocolById(id);

    if (!protocol) {
      next(new NotFoundError(`Protocol '${id}' not found.`));
      return;
    }

    const phases: ProtocolPhaseDetail[] = protocol.phases.map((ph) => ({
      phaseIndex: ph.phaseIndex,
      label: ph.label,
      durationDays: ph.durationDays,
      instructions: ph.instructions,
    }));

    const detail: ProtocolDetail = {
      protocolId: protocol.protocolId,
      version: protocol.version,
      goal: protocol.goal,
      durationDays: protocol.durationDays,
      status: protocol.status,
      phases,
      challengeCount: protocol.challengeIds.length,
      createdAt: protocol.createdAt,
    };

    const body: ApiSuccessResponse<ProtocolDetail> = {
      success: true,
      data: detail,
      generatedAt: new Date().toISOString(),
    };

    res.status(200).json(body);
  } catch (err) {
    next(err);
  }
}
