import { Request, Response, Router } from "express";
import { store } from "../data/store";

export const protocolsRouter = Router();

protocolsRouter.get("/", (_req: Request, res: Response) => {
  res.json({ protocols: store.protocols });
});
