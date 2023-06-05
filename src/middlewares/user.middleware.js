// MIDDLEWARE
function checkToken(req, res, next) {
    // este é um middleware
    const authHeader = req.headers["authorization"]; // PEGA da req.headers indice authorization
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ msg: "token invalido" });
    }
    try {
      const secret = process.env.SECRET;
      jwt.verify(token, secret); // verifica o token na secret
      next();
    } catch (error) {
      res.status(400).json({ msg: "token do try invalido ou expirou" });
    }
  }
//  module.exports = checkToken()
  