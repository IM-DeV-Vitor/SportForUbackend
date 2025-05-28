import express from "express"
import userRouter from "./routes/userRoutes.js"
import loginRouter from "./routes/loginUser.js"
import registerRouter from "./routes/registerUser.js"
import cors from "cors"

const app = express()
const port = process.env.PORT || 8080

app.use(express.json())

app.use("/users", userRouter)
app.use("/auth", loginRouter)
app.use("/auth", registerRouter)

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
})