/**
 * protocolController.ts — Public protocol endpoint controllers
 *
 * Storage selection is controlled by the validated runtime configuration.
 * In-memory seed data is available only when the application was explicitly
 * constructed in development or test memory mode.
 */

import { NextFunction, Request, Response } from "express";
import { RuntimeConfig } from "../../config/runtime";
import { NotFoundError } from "../middleware/errorHandler";
import { ProtocolService } from "../services/protocolService";
import { ApiSuccessResponse, ProtocolDetail, ProtocolSummary } from "../types";
import { getAllProtocols, getProtocolById } from "./protocolStore";

let databaseProtocolService: ProtocolService | undefined;

function protocolServiceFor(res: Response): ProtocolService | null {
  const config = res.app.locals.runtimeConfig as Readonly<RuntimeConfig>;
  if (config.storageMode !== "database") return null;
  if (!databaseProtocolService) {
    // Lazy import keeps memory-mode tests independent of Prisma startup.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaProtocolRepository } = require(
      "../../db/implementations/PrismaProtocolRepository"
    ) as typeof import("../../db/implementations/PrismaProtocolRepository");
    databaseProtocolService = new ProtocolService(new PrismaProtocolRepository());
  }
  return databaseProtocolService;
}

export function listProtocols(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  const protocolService = protocolServiceFor(res);
  const serviceCall = protocolService
    ? protocolService.listProtocols()
    : Promise.resolve(
        getAllProtocols().map((p) => ({
          protocolId: p.protocolId,
          version: p.version,
          goal: p.goal,
          durationDays: p.durationDays,
          status: p.status,
          phaseCount: p.phases.length,
          createdAt: p.createdAt,
        }))
      );

  serviceCall
    .then((summaries: ProtocolSummary[]) => {
      const body: ApiSuccessResponse<ProtocolSummary[]> = {
        success: true,
        data: summaries,
        generatedAt: new Date().toISOString(),
      };
      res.status(200).json(body);
    })
    .catch(next);
}

export function getProtocol(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id = req.params["id"] as string;
  const protocolService = protocolServiceFor(res);
  const serviceCall = protocolService
    ? protocolService.getProtocol(id)
    : Promise.resolve((() => {
        const protocol = getProtocolById(id);
        if (!protocol) return null;
        return {
          protocolId: protocol.protocolId,
          version: protocol.version,
          goal: protocol.goal,
          durationDays: protocol.durationDays,
          status: protocol.status,
          phases: protocol.phases.map((ph) => ({
            phaseIndex: ph.phaseIndex,
            label: ph.label,
            durationDays: ph.durationDays,
            instructions: ph.instructions,
          })),
          challengeCount: protocol.challengeIds.length,
          createdAt: protocol.createdAt,
        };
      })());

  serviceCall
    .then((detail: ProtocolDetail | null) => {
      if (!detail) {
        next(new NotFoundError(`Protocol '${id}' not found.`));
        return;
      }

      const body: ApiSuccessResponse<ProtocolDetail> = {
        success: true,
        data: detail,
        generatedAt: new Date().toISOString(),
      };

      res.status(200).json(body);
    })
    .catch(next);
}
