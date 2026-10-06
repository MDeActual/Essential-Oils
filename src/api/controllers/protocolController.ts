import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../middleware/errorHandler";
import type { RuntimeConfig } from "../runtime";
import { tenantIdFromResponse } from "../security/middleware";
import { ProtocolService } from "../services/protocolService";
import { ApiSuccessResponse, ProtocolDetail, ProtocolSummary } from "../types";
import { MemoryProtocolRepository } from "./protocolStore";

function protocolServiceFor(res: Response, tenantId: string): ProtocolService {
  const config = res.app.locals.runtimeConfig as Readonly<RuntimeConfig>;
  if (config.storageMode !== "database") {
    return new ProtocolService(new MemoryProtocolRepository(tenantId));
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaProtocolRepository } = require(
    "../../db/implementations/PrismaProtocolRepository"
  ) as typeof import("../../db/implementations/PrismaProtocolRepository");
  return new ProtocolService(new PrismaProtocolRepository(tenantId));
}

export function listProtocols(_req: Request, res: Response, next: NextFunction): void {
  const tenantId = tenantIdFromResponse(res);
  const protocolService = protocolServiceFor(res, tenantId);

  protocolService
    .listProtocols()
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

  protocolService
    .getProtocol(id)
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
