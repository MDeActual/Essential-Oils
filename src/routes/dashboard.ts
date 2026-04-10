import { Response, Router } from "express";
import { AuthenticatedRequest, requireAuth, requireRoles } from "../middleware/authMiddleware";
import { prisma } from "../db/client";

export const dashboardRouter = Router();

// Contributor view
dashboardRouter.get(
  "/contributor",
  requireAuth,
  requireRoles(["contributor"]),
  async (req: AuthenticatedRequest, res: Response) => {
    const contributorId = req.user?.contributorId;
    if (!contributorId) return res.status(400).json({ error: "missing_contributor_context" });
    const outcomes = await prisma.outcome.findMany({ where: { contributorId }, take: 20, orderBy: { createdAt: "desc" } });
    res.json({ outcomes });
  }
);

// Admin overview
dashboardRouter.get(
  "/admin/metrics",
  requireAuth,
  requireRoles(["admin"]),
  async (_req: AuthenticatedRequest, res: Response) => {
    const [contributors, protocols, challenges, outcomes] = await Promise.all([
      prisma.contributor.count(),
      prisma.protocol.count(),
      prisma.challenge.count(),
      prisma.outcome.count(),
    ]);
    res.json({ counts: { contributors, protocols, challenges, outcomes } });
  }
);

// Practitioner insights
dashboardRouter.get(
  "/practitioner/insights",
  requireAuth,
  requireRoles(["practitioner", "admin"]),
  async (_req: AuthenticatedRequest, res: Response) => {
    const topProtocols = await prisma.outcome.groupBy({
      by: ["protocolId"],
      _avg: { adherence: true },
      _count: { _all: true },
      orderBy: { _avg: { adherence: "desc" } },
      take: 5,
    });
    res.json({ topProtocols });
  }
);
