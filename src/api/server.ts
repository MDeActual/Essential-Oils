/**
 * server.ts — Express Application Factory
 *
 * Assembles the read-only Phyto.ai API and binds it to loader-produced runtime
 * configuration. OIDC mode receives a verifier built from the static trusted
 * issuer/audience/JWKS configuration. Test-only dependency injection is
 * permitted for cryptographic boundary tests and rejected elsewhere.
 */

import express, { Request, Response } from "express";
import { errorHandler } from "./middleware/errorHandler";
import analyticsRouter from "./routes/analytics";
import healthRouter from "./routes/health";
import protocolsRouter from "./routes/protocols";
import {
  RuntimeConfig,
  RuntimeConfigurationError,
  assertValidatedRuntimeConfig,
  loadRuntimeConfig,
} from "./runtime";
import { createOidcTokenVerifier } from "./security/identity";
import type { SecurityDependencies } from "./security/middleware";
import { ApiErrorResponse } from "./types";

const CORS_ALLOW_METHODS = "GET,OPTIONS";
const CORS_ALLOW_HEADERS = "Authorization, Content-Type, X-Phyto-Tenant-Id";

export function createApp(
  runtimeConfig: Readonly<RuntimeConfig> = loadRuntimeConfig(),
  securityDependencies: Readonly<SecurityDependencies> = {}
): express.Application {
  assertValidatedRuntimeConfig(runtimeConfig);

  if (securityDependencies.tokenVerifier && runtimeConfig.runtimeMode !== "test") {
    throw new RuntimeConfigurationError(
      "Custom token verifiers are permitted only in the test runtime."
    );
  }
  if (runtimeConfig.authMode === "disabled" && securityDependencies.tokenVerifier) {
    throw new RuntimeConfigurationError(
      "Disabled authentication cannot accept a token verifier."
    );
  }

  const app = express();
  app.locals.runtimeConfig = runtimeConfig;
  if (runtimeConfig.authMode === "oidc") {
    app.locals.tokenVerifier = securityDependencies.tokenVerifier
      ?? createOidcTokenVerifier(runtimeConfig.oidc!);
  }

  app.disable("x-powered-by");
  app.use(express.json({ limit: "64kb" }));
  app.use((req, res, next) => {
    const allowedOrigins = runtimeConfig.corsAllowedOrigins;
    if (allowedOrigins.length === 0) {
      next();
      return;
    }

    res.vary("Origin");
    const origin = req.headers.origin;
    if (typeof origin !== "string" || origin.length === 0) {
      next();
      return;
    }

    if (!allowedOrigins.includes(origin)) {
      if (req.method === "OPTIONS") {
        const body: ApiErrorResponse = {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "The request origin is not allowed.",
          },
          generatedAt: new Date().toISOString(),
        };
        res.status(403).json(body);
        return;
      }
      next();
      return;
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", CORS_ALLOW_METHODS);
    res.setHeader("Access-Control-Allow-Headers", CORS_ALLOW_HEADERS);
    if (req.method === "OPTIONS") {
      res.status(204).send();
      return;
    }
    next();
  });

  app.use("/health", healthRouter);
  app.use("/protocols", protocolsRouter);
  app.use("/analytics", analyticsRouter);

  app.use((_req: Request, res: Response) => {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found.",
      },
      generatedAt: new Date().toISOString(),
    };
    res.status(404).json(body);
  });

  app.use(errorHandler);

  return app;
}
