import { Router } from "express";

export default function userRouterFactory(prisma) { 
  const userRouter = Router();

  userRouter.get("/", async (req, res) => {
    try {

      const loggedUsers = await prisma.user.findMany();

      res.status(200).send({
        Users: loggedUsers
      });
    } catch (err) {
      console.error("Erro ao buscar todos os usuários:", err); 
      res.status(500).send({
        "Erro: ": err.message 
      });
    }
  });

  userRouter.get("/by-email/:email", async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: req.params.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });

      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.status(200).json(user);
    } catch (err) {
      console.error("Erro ao buscar usuário por email:", err); 
      res.status(500).json({ message: "Erro ao buscar usuário por email", error: err.message });
    }
  });

  userRouter.get("/:id", async (req, res) => {
    try {
      const loggedUserById = await prisma.user.findUnique({
        where: {
          id: req.params.id
        }
      });

      if (!loggedUserById) {
          return res.status(404).json({ message: "Usuário não encontrado." });
      }

      res.status(200).send({
        User: loggedUserById
      });
    } catch (err) {
      console.error("Erro ao buscar usuário por ID:", err);
      res.status(500).send({
        "Erro: ": err.message
      });
    }
  });

  userRouter.post("/", async (req, res) => {
    try {
      const createdUser = await prisma.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        }
      });
      res.status(201).send({
        createdUser
      });
    } catch (err) {
      console.error("Erro ao criar usuário via POST /users:", err);
      res.status(500).send({
        "Erro: ": err.message
      });
    }
  });

  userRouter.put("/:id", async (req, res) => {
    try {
      const editedUser = await prisma.user.update({
        where: {
          id: req.params.id
        },
        data: {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password, 
        }
      });

      res.status(200).send({
        editedUser
      });
    } catch (err) {
      console.error("Erro ao atualizar usuário por ID:", err); 
      res.status(500).send({
        "Erro: ": err.message
      });
    }
  });

  userRouter.delete("/:id", async (req, res) => {
    try {
      const DeletedUser = await prisma.user.delete({
        where: {
          id: req.params.id
        }
      });

      res.status(200).send({
        DeletedUser
      });
    } catch (err) {
      console.error("Erro ao deletar usuário por ID:", err); 
      res.status(500).send({
        "Erro: ": err.message
      });
    }
  });

  return userRouter;
}