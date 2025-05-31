import { Router } from "express";

export default function registerRouterFactory(prisma) { 
  const registerRouter = Router();

  registerRouter.post("/", async (req, res) => {
    console.log("Requisição de register recebida:", req.body);
    const { name, email, password } = req.body;
    try {
      const lfPeople = await prisma.user.findUnique({ where: { email } });
      if (lfPeople) {
        return res.status(400).json({ message: "Usuário já cadastrado" });
      }

      const user = await prisma.user.create({
        data: { email, password, name }
      });
      res.status(201).json({ message: "Registro bem-sucedido!", user: { id: user.id, email: user.email, name: user.name } }); 
    } catch (err) {
      console.error("Erro no registro:", err); 
      res.status(500).json({ message: "Erro interno do servidor", error: err.message });
    }
  });

  registerRouter.put("/update", async (req, res) => {
    const { email, name, newEmail } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      await prisma.user.update({
        where: { email },
        data: {
          name,
          email: newEmail || email,
        },
      });

      res.status(200).json({ message: "Dados atualizados com sucesso!" });
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err); 
      res.status(500).json({ message: "Erro ao atualizar usuário", error: err.message });
    }
  });

  return registerRouter;
}