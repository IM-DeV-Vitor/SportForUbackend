import express from "express"
import userRouter from "./routes/userRoutes.js"
import loginRouter from "./routes/loginUser.js"
import registerRouter from "./routes/registerUser.js"
import cors from "cors"

const app = express()
const port = process.env.PORT || 8080

app.use(cors({
  origin: ["http://localhost:5173", "https://sport-for-u.vercel.app"], 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));

app.use(express.json())

app.use("/users", userRouter)
app.use("/auth", loginRouter)
app.use("/auth", registerRouter)
app.use("/auth/register", registerRouter)

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`)
})