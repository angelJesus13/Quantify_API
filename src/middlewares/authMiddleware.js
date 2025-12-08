const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ ok: false, message: "No autorizado" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuario.findById(decoded.id).select("-password");
        if (!usuario) {
            return res.status(401).json({ ok: false, message: "Usuario no encontrado" });
        }

        req.user = usuario;
        next();
    } catch (error) {
        res.status(401).json({ ok: false, message: "Token inválido" });
    }
};

module.exports = authMiddleware;