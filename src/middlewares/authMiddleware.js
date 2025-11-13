const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Esperamos algo tipo: "Bearer token..."
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json({ ok: false, message: "No autorizado, token faltante" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuario.findById(decoded.id).select("-password");
        if (!usuario) {
            return res
                .status(401)
                .json({ ok: false, message: "No autorizado, usuario no encontrado" });
        }

        // Inyectamos el usuario en la request
        req.user = usuario;
        next();
    } catch (error) {
        console.error("Error en authMiddleware:", error);
        res.status(401).json({ ok: false, message: "Token inválido o expirado" });
    }
};

module.exports = authMiddleware;
