import { Router } from "express";

export default function walkRouterFactory(prisma) {
  console.log("Prisma client recebido:", !!prisma);
  if (prisma) {
    console.log("Prisma.$transaction disponível:", typeof prisma.$transaction);
    console.log("Prisma.DailyDistance disponível:", !!prisma.DailyDistance);
  }

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

    const parsedDistance = parseFloat(distance);

    if (!userId || isNaN(parsedDistance)) {
      console.error(
        "Requisição inválida: userId e distância são obrigatórios."
      );
      return res.status(400).json({
        error: "ID de usuário e distância válida são obrigatórios.",
      });
    }

    try {
      const today = new Date(date);
      today.setUTCHours(0, 0, 0, 0);

      const weekStart = getWeekStart(today);
      const month = today.getUTCMonth() + 1;
      const year = today.getUTCFullYear();

      const result = await prisma.$transaction(async (tx) => {
        let dailyRecord;
        const existingDaily = await tx.DailyDistance.findFirst({
          where: { userId, date: today },
        });

        if (existingDaily) {
          dailyRecord = await tx.DailyDistance.update({
            where: { id: existingDaily.id },
            data: { distance: existingDaily.distance + parsedDistance },
          });
        } else {
          dailyRecord = await tx.DailyDistance.create({
            data: { date: today, distance: parsedDistance, userId },
          });
        }

        let weeklyRecord;
        const existingWeekly = await tx.WeeklyDistance.findFirst({
          where: { userId, weekStart },
        });

        if (existingWeekly) {
          weeklyRecord = await tx.WeeklyDistance.update({
            where: { id: existingWeekly.id },
            data: { distance: existingWeekly.distance + parsedDistance },
          });
        } else {
          weeklyRecord = await tx.WeeklyDistance.create({
            data: { weekStart, distance: parsedDistance, userId },
          });
        }

        let monthlyRecord;
        const existingMonthly = await tx.MonthlyDistance.findFirst({
          where: { userId, month, year },
        });

        if (existingMonthly) {
          monthlyRecord = await tx.MonthlyDistance.update({
            where: { id: existingMonthly.id },
            data: { distance: existingMonthly.distance + parsedDistance },
          });
        } else {
          monthlyRecord = await tx.MonthlyDistance.create({
            data: { userId, month, year, distance: parsedDistance },
          });
        }

        let totalRecord;
        const existingTotal = await tx.TotalDistance.findUnique({
          where: { userId },
        });

        if (existingTotal) {
          totalRecord = await tx.TotalDistance.update({
            where: { userId },
            data: { distance: existingTotal.distance + parsedDistance },
          });
        } else {
          totalRecord = await tx.TotalDistance.create({
            data: { userId, distance: parsedDistance },
          });
        }

        return { dailyRecord, weeklyRecord, monthlyRecord, totalRecord };
      });

      console.log(
        "Distâncias salvas com sucesso para o usuário:",
        userId,
        result
      );
      return res.status(200).json(result.dailyRecord);
    } catch (error) {
      console.error("Erro ao registrar distâncias:", error);
      return res.status(500).json({
        error: "Erro interno do servidor ao registrar distância.",
        details: error.message,
      });
    }
  });

  walkRouter.post("/getAllDistances", async (req, res) => {
    const { userId, date } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ error: "userId e date são obrigatórios." });
    }

    try {
      const parsedDate = new Date(date);
      parsedDate.setUTCHours(0, 0, 0, 0);

      const weekStart = getWeekStart(parsedDate);
      const month = parsedDate.getUTCMonth() + 1;
      const year = parsedDate.getUTCFullYear();

      const dayStart = new Date(parsedDate);
      const dayEnd = new Date(parsedDate);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const daily = await prisma.DailyDistance.findFirst({
        where: {
          userId,
          date: { gte: dayStart, lte: dayEnd },
        },
        select: { distance: true },
      });

      const weekly = await prisma.WeeklyDistance.findFirst({
        where: {
          userId,
          weekStart,
        },
        select: { distance: true },
      });

      const monthly = await prisma.MonthlyDistance.findFirst({
        where: {
          userId,
          month,
          year,
        },
        select: { distance: true },
      });

      const total = await prisma.TotalDistance.findUnique({
        where: { userId },
        select: { distance: true },
      });

      return res.json({
        dailyDistance: daily?.distance || 0,
        weeklyDistance: weekly?.distance || 0,
        monthlyDistance: monthly?.distance || 0,
        totalDistance: total?.distance || 0,
      });
    } catch (err) {
      console.error("Erro ao buscar distâncias agregadas:", err);
      return res
        .status(500)
        .json({ error: "Erro interno ao buscar distâncias." });
    }
  });

  return walkRouter;
}
