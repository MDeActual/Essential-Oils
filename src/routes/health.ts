import { Request, Response, Router } from "express";
import { env } from "../config/env";

export const healthRouter = Router();

healthRouter.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    appEnv: env.APP_ENV,
    privacyModeStrict: env.PRIVACY_MODE_STRICT,
  });
});
