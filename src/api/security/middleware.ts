import { NextFunction, Request, RequestHandler, Response } from "express";
import type { RuntimeConfig } from "../runtime";
import type { ApiErrorResponse } from "../types";
import {
  AuthenticatedPrincipal,
  TokenVerifier,
} from "./identity";

const BEARER_TOKEN = /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/u;
const TENANT_HEADER = "x-phyto-tenant-id";

export interface SecurityDependencies {
  tokenVerifier?: TokenVerifier;
}

function runtimeConfig(res: Response): Readonly<RuntimeConfig> {
  return res.app.locals.runtimeConfig as Readonly<RuntimeConfig>;
}

function verifier(res: Response): TokenVerifier | null {
  return (res.app.locals.tokenVerifier as TokenVerifier | undefined) ?? null;
}

function principal(res: Response): Readonly<AuthenticatedPrincipal> | null {
  return (res.locals.principal as Readonly<AuthenticatedPrincipal> | undefined) ?? null;
}

function errorResponse(
  res: Response,
  status: 401 | 403,
  code: "UNAUTHENTICATED" | "FORBIDDEN",
  message: string
): void {
  const body: ApiErrorResponse = {
    success: false,
    error: { code, message },
    generatedAt: new Date().toISOString(),
  };
  if (status === 401) {
    res.setHeader("WWW-Authenticate", "Bearer");
  }
  res.status(status).json(body);
}

export async function authenticateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const config = runtimeConfig(res);
  if (config.authMode === "disabled") {
    next();
    return;
  }

  const authorization = req.headers.authorization;
  const match = typeof authorization === "string"
    ? BEARER_TOKEN.exec(authorization)
    : null;
  if (!match) {
    errorResponse(res, 401, "UNAUTHENTICATED", "A valid bearer token is required.");
    return;
  }

  const tokenVerifier = verifier(res);
  if (!tokenVerifier) {
    errorResponse(res, 401, "UNAUTHENTICATED", "A valid bearer token is required.");
    return;
  }

  try {
    res.locals.principal = await tokenVerifier.verify(match[1]);
    next();
  } catch {
    errorResponse(res, 401, "UNAUTHENTICATED", "A valid bearer token is required.");
  }
}

export function requirePermission(permission: string): RequestHandler {
  return (_req, res, next): void => {
    if (runtimeConfig(res).authMode === "disabled") {
      next();
      return;
    }
    const authenticated = principal(res);
    if (!authenticated || !authenticated.permissions.includes(permission)) {
      errorResponse(res, 403, "FORBIDDEN", "The authenticated principal is not authorized.");
      return;
    }
    next();
  };
}

export const requireTenantContext: RequestHandler = (req, res, next): void => {
  if (runtimeConfig(res).authMode === "disabled") {
    next();
    return;
  }

  const authenticated = principal(res);
  const requestedTenant = req.headers[TENANT_HEADER];
  if (!authenticated
      || typeof requestedTenant !== "string"
      || requestedTenant.length === 0
      || requestedTenant !== authenticated.tenantId) {
    errorResponse(res, 403, "FORBIDDEN", "The requested tenant context is not authorized.");
    return;
  }
  res.locals.tenantId = authenticated.tenantId;
  next();
};

export function protectedReadBoundary(permission: string): RequestHandler[] {
  return [authenticateRequest, requireTenantContext, requirePermission(permission)];
}
