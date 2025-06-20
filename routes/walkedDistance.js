import { Router } from "express";

export default function walkRouterFactory(prisma) {
  const walkRouter = Router();

  function getWeekStart(date) {
    const d = new Date(date);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day;
    d.setUTCDate(diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  function getMonthStart(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  walkRouter.post("/", async (req, res) => {
    const { date, distance, userId } = req.body;

    if (!userId) {
      console.error(
        "walkedDistance: userId não fornecido na requisição. Não é possível registrar distância."
      );
      return res.status(400).json({
        error: "ID de usuário é obrigatório para registrar distância.",
      });
    }

    try {
      const today = new Date(date);
      today.setUTCHours(0, 0, 0, 0);

      const existing = await prisma.DailyDistance.findFirst({
        where: {
          userId,
          date: today,
        },
      });

      const weekStart = getWeekStart(today);
      const existingWeek = await prisma.WeeklyDistance.findFirst({
        where: { userId, weekStart },
      });
      if (existingWeek) {
        await prisma.WeeklyDistance.update({
          where: { id: existingWeek.id },
          data: { distance: existingWeek.distance + distance },
        });
      } else {
        await prisma.WeeklyDistance.create({
          data: { weekStart, distance, userId },
        });
      }

      const month = today.getUTCMonth() + 1;
      const year = today.getUTCFullYear();
      const existingMonth = await prisma.MonthlyDistance.findFirst({
        where: { userId, month, year },
      });
      if (existingMonth) {
        await prisma.MonthlyDistance.update({
          where: { id: existingMonth.id },
          data: { distance: existingMonth.distance + distance },
        });
      } else {
        await prisma.MonthlyDistance.create({
          data: { userId, month, year, distance },
        });
      }

      const existingTotal = await prisma.TotalDistance.findUnique({
        where: { userId: userId },
      });
      if (existingTotal) {
        await prisma.TotalDistance.update({
          where: { userId: userId },
          data: { distance: existingTotal.distance + distance },
        });
      } else {
        await prisma.TotalDistance.create({
          data: { userId: userId, distance },
        });
      }

      if (existing) {
        const updated = await prisma.DailyDistance.update({
          where: { id: existing.id },
          data: { distance: existing.distance + distance },
        });
        console.log("Distância atualizada:", updated);
        return res.json(updated);
      } else {
        const created = await prisma.DailyDistance.create({
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
        return res.json({ distance: 0 });
      }
    } catch (err) {
      console.error("Erro ao buscar distância:", err);
      res.status(500).json({ error: "Erro interno ao buscar distância." });
    }
  });

  return walkRouter;
}
