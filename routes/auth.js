import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
  let token = req.headers["authorization"]?.split(" ")[1];
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }

  if (!token) return res.status(401).json({ error: "Token não fornecido" });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token inválido" });
  }
}
