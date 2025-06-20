import { Router } from "express";

export default function walkRouterFactory(prisma) {
  const walkRouter = Router();

  walkRouter.post("/", async (req, res) => {
    const { date, distance, userId } = req.body;

    if (!userId) {
      console.error(
        "walkedDistance: userId não fornecido na requisição. Não é possível registrar distância."
      );
      return res
        .status(400)
        .json({
          error: "ID de usuário é obrigatório para registrar distância.",
        });
    }

    try {
      const today = new Date(date);
      today.setUTCHours(0, 0, 0, 0);
      const existing = await prisma.dailyDistance.findFirst({
        where: {
          userId,
          date: today,
        },
      });

      if (existing) {
        const updated = await prisma.dailyDistance.update({
          where: { id: existing.id },
          data: { distance: existing.distance + distance },
        });
        console.log("Distância atualizada:", updated);
        return res.json(updated);
      } else {
        const created = await prisma.dailyDistance.create({
          data: { date: today, distance, userId },
        });
        console.log("Nova distância criada:", created);
        return res.json(created);
      }
    } catch (error) {
      console.error(
        "Erro ao processar distância percorrida no backend:",
        error
      );
      res.status(500).json({
        error: "Erro interno do servidor ao registrar distância.",
        details: error.message,
      });
    }
  });

  walkRouter.post("/get", async (req, res) => {
    const { userId, date } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ error: "userId e date são obrigatórios." });
    }

    try {
      const parsedDate = new Date(date);
      parsedDate.setUTCHours(0, 0, 0, 0);

      const existing = await prisma.dailyDistance.findFirst({
        where: {
          userId,
          date: parsedDate,
        },
      });

      if (existing) {
        return res.json({ distance: existing.distance });
      } else {
        return res.json({ distance: 0 }); // Caso não exista entrada, assume-se 0.
      }
    } catch (err) {
      console.error("Erro ao buscar distância:", err);
      res.status(500).json({ error: "Erro interno ao buscar distância." });
    }
  });

  return walkRouter;
}
