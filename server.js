import express from "express"
import userRouter from "./routes/userRoutes.js"
import loginRouter from "./routes/loginUser.js"
import cors from "cors"

const app = express()
const port = 8080

app.use(cors())
app.use(express.json())

app.use("/users", userRouter)
app.use("/auth", loginRouter)

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
})