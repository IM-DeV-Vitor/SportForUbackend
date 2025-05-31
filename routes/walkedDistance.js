import { Router } from "express";

export default function walkRouterFactory(prisma) {
  const walkRouter = Router();

  walkRouter.post("/", async (req, res) => {
    const { date, distance, userId } = req.body;

    if (!userId) {
      console.error("walkedDistance: userId não fornecido na requisição. Não é possível registrar distância.");
      return res.status(400).json({ error: "ID de usuário é obrigatório para registrar distância." });
    }

    try {
      const today = new Date(date);
      today.setUTCHours(0, 0, 0, 0); 
      const existing = await prisma.dailyDistance.findFirst({
        where: {
          userId,
          date: today
        }
      });

      if (existing) {
        const updated = await prisma.dailyDistance.update({
          where: { id: existing.id },
          data: { distance: existing.distance + distance } 
        });
        console.log("Distância atualizada:", updated);
        return res.json(updated);
      } else {
        const created = await prisma.dailyDistance.create({
          data: { date: today, distance, userId } 
        });
        console.log("Nova distância criada:", created);
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