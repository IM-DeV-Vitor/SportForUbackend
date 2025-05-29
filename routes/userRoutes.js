import { Router } from "express";
import prisma from "../db/index.js";

const userRouter = Router()

userRouter.get("/", async (req, res) => {
    try {
        const loggedUsers = await prisma.user.findMany()

        res.status(200).send({
            Users : loggedUsers
        })
    }
    catch (err) {
        res.status(500).send({
            "Erro: ": err
        })
    }
})

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
        res.status(500).json({ message: "Erro ao buscar usuário por email" });
    }
});

userRouter.get("/:id", async (req, res) => {
    try {
        const loggedUserById = await prisma.user.findUnique({
            where : {
                id : req.params.id
            }
        })
    
        res.status(200).send({
            User : loggedUserById
        })
    }
    
    catch (err) {
        res.status(500).send({
            "Erro: ": err
        })
    }
})

userRouter.post("/", async (req, res) => {
    try {
        const createdUser = await prisma.user.create({
            data : {
                name : req.body.name,
                email : req.body.email,
                password : req.body.password,
            } 
        })
            res.status(201).send({
                createdUser
            })
    }
    catch (err) {
        res.status(500).send({
            "Erro: ": err
        })
    }
    
})

userRouter.put("/:id", async (req, res) => {
    try {
        const editedUser = await prisma.user.update({
            where : {
                id : req.params.id 
            },
            data : {
                name : req.body.name,
                email : req.body.email,
                password : req.body.password,
            }
        })
    
        res.status(200).send({
            editedUser
        })
    }
    catch (err) {
        res.status(500).send({
            "Erro: ": err
        })
    }

})

userRouter.delete("/:id", async (req, res) => {
    try {
        const DeletedUser = await prisma.user.delete({
            where : {
                id : req.params.id 
            }
        })
    
        res.status(200).send({
            DeletedUser
        })
    }
    catch (err) {
        res.status(500).send({
            "Erro: ": err
        })
    }

})


export default userRouter;