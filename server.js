import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import userRouterFactory from "./routes/userRoutes.js";
import loginRouterFactory from "./routes/loginUser.js";
import registerRouterFactory from "./routes/registerUser.js";
import walkRouterFactory from "./routes/walkedDistance.js";
import cron from "node-cron";

const app = express();
const port = process.env.PORT || 8080;
const prisma = new PrismaClient();

cron.schedule("5 0 * * *", async () => {
  console.log("Executando tarefa diária de limpeza de dados...");

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  const result = await prisma.dailyDistance.deleteMany({
    where: {
      date: {
        lt: today,
      },
    },
  });
});

app.use(
  cors({
    origin: ["http://localhost:5173", "https://sport-for-u.vercel.app"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use("/auth", loginRouterFactory(prisma));
app.use("/auth/register", registerRouterFactory(prisma));
app.use("/users", userRouterFactory(prisma));
app.use("/distance/update", walkRouterFactory(prisma));

app.listen(port, async () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  try {
    await prisma.$connect();
    console.log("Conectado ao banco de dados com Prisma!");
  } catch (e) {
    console.error("Erro ao conectar ao banco de dados:", e);
  }
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.log("Desconectado do banco de dados.");
});
