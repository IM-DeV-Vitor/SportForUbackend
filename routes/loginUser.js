import { Router } from "express";
import prisma from "../db/index.js";

const loginRouter = Router()

loginRouter.post("/login", async (req, res) => {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where : { email }
                
            })
            if (!user || user.password != password) {
                return res.status(401).json({message : "Invalid credentials"})
            }

            res.status(200).json({message:"Logged successfully!"})
        }
        catch (err) {
            res.status(500).send({
                "Error: ": err
            })
        }
})

export default loginRouter;