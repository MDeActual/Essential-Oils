import express, { Request, Response } from "express";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { protocolsRouter } from "./routes/protocols";
import { challengesRouter } from "./routes/challenges";
import { outcomesRouter } from "./routes/outcomes";
import { analyticsRouter } from "./routes/analytics";
import { dashboardRouter } from "./routes/dashboard";
import { authRouter } from "./routes/auth";
import { integrationsRouter } from "./routes/integrations";

const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/health", healthRouter);
app.use("/protocols", protocolsRouter);
app.use("/challenges", challengesRouter);
app.use("/outcomes", outcomesRouter);
app.use("/analytics", analyticsRouter);
app.use("/dashboard", dashboardRouter);
app.use("/integrations", integrationsRouter);

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Phyto.ai API scaffold",
    routes: ["/health", "/protocols", "/challenges", "/outcomes"],
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "not_found", path: req.path });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Phyto.ai service running on port ${env.PORT} (env=${env.APP_ENV})`);
});
