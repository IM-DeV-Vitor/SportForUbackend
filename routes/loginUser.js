import { Router } from "express";
import jwt from "jsonwebtoken";

export default function loginRouterFactory(prisma) {
  const loginRouter = Router();

  loginRouter.post("/login", async (req, res) => {
    console.log("Requisição de login recebida:", req.body);
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const token = jwt.sign({ id: user.id }, "pintoEnormeNaBocaDoIsaque", {
        expiresIn: "1d"
      });

      res.status(200).json({ token });
    } catch (err) {
      console.error("Erro no login:", err);
      res.status(500).json({ message: "Erro interno do servidor", error: err.message });
    }
  });

  return loginRouter;
}