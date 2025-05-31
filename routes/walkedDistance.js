import { Router } from "express";
import { authenticateToken } from "./auth.js";

export default function walkRouterFactory(prisma) { 
  const walkRouter = Router();

  walkRouter.post("/", authenticateToken, async (req, res) => {
    const { date, distance } = req.body;
    const userId = req.userId; 

    if (!userId) {
      console.error("walkedDistance: userId não definido após autenticação. Requisição não autorizada?");

      return res.status(401).json({ error: "ID de usuário não disponível. Requisição não autorizada." });
    }

    try {
      const existing = await prisma.dailyDistance.findFirst({
        where: { userId, date: new Date(date) } 
      });

      if (existing) {
        const updated = await prisma.dailyDistance.update({
          where: { id: existing.id },
          data: { distance: existing.distance + distance }
        });
        return res.json(updated); 
      } else {
        const created = await prisma.dailyDistance.create({
          data: { date: new Date(date), distance, userId } 
        });
        return res.json(created); 
      }
    } catch (error) {
      console.error("Erro ao processar distância percorrida no backend:", error);
      res.status(500).json({ 
        error: "Erro interno do servidor ao registrar distância.", 
        details: error.message
      });
    }
  });

  return walkRouter;
}