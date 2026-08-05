import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../middleware/errorHandler";
import type { RuntimeConfig } from "../runtime";
import { tenantIdFromResponse } from "../security/middleware";
import { ProtocolService } from "../services/protocolService";
import { ApiSuccessResponse, ProtocolDetail, ProtocolSummary } from "../types";
import { getAllProtocols, getProtocolById } from "./protocolStore";

function protocolServiceFor(res: Response, tenantId: string): ProtocolService | null {
  const config = res.app.locals.runtimeConfig as Readonly<RuntimeConfig>;
  if (config.storageMode !== "database") return null;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaProtocolRepository } = require(
    "../../db/implementations/PrismaProtocolRepository"
  ) as typeof import("../../db/implementations/PrismaProtocolRepository");
  return new ProtocolService(new PrismaProtocolRepository(tenantId));
}

export function listProtocols(_req: Request, res: Response, next: NextFunction): void {
  const tenantId = tenantIdFromResponse(res);
  const protocolService = protocolServiceFor(res, tenantId);
  const serviceCall = protocolService
    ? protocolService.listProtocols()
    : Promise.resolve(getAllProtocols(tenantId).map((p) => ({
        protocolId: p.protocolId,
        version: p.version,
        goal: p.goal,
        durationDays: p.durationDays,
        status: p.status,
        phaseCount: p.phases.length,
        createdAt: p.createdAt,
      })));

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

export function getProtocol(req: Request, res: Response, next: NextFunction): void {
  const id = req.params["id"] as string;
  const tenantId = tenantIdFromResponse(res);
  const protocolService = protocolServiceFor(res, tenantId);
  const serviceCall = protocolService
    ? protocolService.getProtocol(id)
    : Promise.resolve((() => {
        const protocol = getProtocolById(id, tenantId);
        if (!protocol) return null;
        return {
          protocolId: protocol.protocolId,
          version: protocol.version,
          goal: protocol.goal,
          durationDays: protocol.durationDays,
          status: protocol.status,
          phases: protocol.phases.map((phase) => ({
            phaseIndex: phase.phaseIndex,
            label: phase.label,
            durationDays: phase.durationDays,
            instructions: phase.instructions,
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
