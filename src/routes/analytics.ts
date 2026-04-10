import { Request, Response, Router } from "express";
import { prisma } from "../db/client";
import { outcomeRepository } from "../repositories/outcomeRepository";
import { requireAuth, requireRoles, AuthenticatedRequest } from "../middleware/authMiddleware";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireRoles(["researcher", "admin", "practitioner"]));

analyticsRouter.get("/challenge/:id", async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const summary = await outcomeRepository.aggregateByChallenge(id);
  res.json({ challengeId: id, ...summary });
});

analyticsRouter.get("/protocol/:id/effectiveness", async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const effectiveness = await prisma.outcome.aggregate({
    _avg: { adherence: true },
    where: { protocolId: id },
  });
  res.json({ protocolId: id, avgAdherence: effectiveness._avg.adherence ?? 0 });
});

analyticsRouter.get("/adherence", async (_req: AuthenticatedRequest, res: Response) => {
  const adherence = await prisma.outcome.groupBy({
    by: ["challengeId"],
    _avg: { adherence: true },
    _count: { _all: true },
  });
  res.json({ adherence });
});

analyticsRouter.get("/geo", async (_req: AuthenticatedRequest, res: Response) => {
  const geo = await prisma.contributor.groupBy({
    by: ["region"],
    _count: { _all: true },
  });
  res.json({ regions: geo });
});
