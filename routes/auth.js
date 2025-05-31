import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  let token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    console.warn("Autenticação: Token não fornecido no header Authorization.");
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const payload = jwt.verify(token, "pintoEnormeNaBocaDoIsaque");
    req.userId = payload.id; 
    next(); 
  } catch (err) {
    console.error("Autenticação: Erro de verificação do token:", err.message);
    return res.status(403).json({ error: "Token inválido ou expirado" });
  }
}