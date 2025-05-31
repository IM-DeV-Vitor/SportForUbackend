import { json, Router } from "express";
import prisma from "../db/index.js";
import { authenticateToken } from "./auth.js";

const walkRouter = Router();

walkRouter.post("/", authenticateToken, async (req, res) => {
  const { date, distance } = req.body;
  const userId = req.userId;

  const existing = await prisma.dailyDistance.findFirst({
    where: { userId, date }
  });

  if (existing) {
    const updated = await prisma.dailyDistance.update({
      where: { id: existing.id },
      data: { distance: existing.distance + distance }
    });
    res.json(updated);
  } else {
    const created = await prisma.dailyDistance.create({
      data: { date, distance, userId }
    });
    res.json(created);
  }
});

export default walkRouter;