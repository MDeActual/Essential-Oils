import { Router } from "express";
import { store } from "../data/store";

export const protocolsRouter = Router();

protocolsRouter.get("/", (_req, res) => {
  res.json({ protocols: store.protocols });
});
