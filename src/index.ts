import express from "express";
import { env } from "./config/env";
import { healthRouter } from "./routes/health";
import { protocolsRouter } from "./routes/protocols";
import { challengesRouter } from "./routes/challenges";
import { outcomesRouter } from "./routes/outcomes";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/protocols", protocolsRouter);
app.use("/challenges", challengesRouter);
app.use("/outcomes", outcomesRouter);

app.get("/", (_req, res) => {
  res.json({
    message: "Phyto.ai API scaffold",
    routes: ["/health", "/protocols", "/challenges", "/outcomes"],
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "not_found", path: req.path });
});

app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Phyto.ai service running on port ${env.PORT} (env=${env.APP_ENV})`);
});
