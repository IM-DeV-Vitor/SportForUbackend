import { json, Router } from "express";
import prisma from "../db/index.js";

const registerRouter = Router();

registerRouter.post("/register", async (req, res) => {
    console.log("Requisição de register recebida:", req.body);
    const { name, email, password } = req.body;
    try {
        const lfPeople = await prisma.user.findUnique({where: { email } })
        if(lfPeople) {
           return res.status(400).json({message: "Usuário já cadastrado"});
        }

        
        const user = await prisma.user.create({
        data: {email, password, name}
        });
        res.status(200).json({ message: "Registro bem-sucedido!" });
    } catch (err) {
        console.error("Error in register:", err);
        res.status(500).json({ message: "Erro interno do servidor", error: err.message });
    }
});

export default registerRouter;