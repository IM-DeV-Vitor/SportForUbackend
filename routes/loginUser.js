import { Router } from "express";
import prisma from "../db/index.js";

const loginRouter = Router();

loginRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log("Requisição de login recebida:", email);

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: "Credenciais inválidas" });
        }

        res.status(200).json({ message: "Login bem-sucedido!" });
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ message: "Erro interno do servidor", error: err.message });
    }
});

export default loginRouter;