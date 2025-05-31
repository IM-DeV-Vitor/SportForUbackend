import { Router } from "express";

export default function walkRouterFactory(prisma) { 
  const walkRouter = Router();
  walkRouter.post("/", async (req, res) => {
    const { date, distance, userId, name } = req.body; 
    if (!userId) {
      console.error("walkedDistance: userId não fornecido na requisição. Não é possível registrar distância.");
      return res.status(400).json({ error: "ID de usuário é obrigatório para registrar distância." });
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
          data: { date: new Date(date), distance, userId, name } 
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