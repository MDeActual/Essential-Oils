import { Request, Response, Router } from "express";
import { protocolRepository } from "../repositories/protocolRepository";

export const protocolsRouter = Router();

protocolsRouter.get("/", async (_req: Request, res: Response) => {
  const protocols = await protocolRepository.list();
  res.json({ protocols });
});
