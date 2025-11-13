const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const generarToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
};

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validación básica
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ ok: false, message: "Todos los campos son obligatorios" });
        }

        // ¿Ya existe el usuario?
        const usuarioExistente = await Usuario.findOne({ email });
        if (usuarioExistente) {
            return res
                .status(400)
                .json({ ok: false, message: "El email ya está registrado" });
        }

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario
        const nuevoUsuario = await Usuario.create({
            name,
            email,
            password: hashedPassword,
        });

        // Generar token
        const token = generarToken(nuevoUsuario._id);

        return res.status(201).json({
            ok: true,
            message: "Usuario registrado correctamente",
            user: {
                id: nuevoUsuario._id,
                name: nuevoUsuario.name,
                email: nuevoUsuario.email,
            },
            token,
        });
    } catch (error) {
        console.error("Error en register:", error);
        res.status(500).json({ ok: false, message: "Error en servidor" });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res
                .status(400)
                .json({ ok: false, message: "Email y contraseña son obligatorios" });
        }

        // Buscar usuario
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res
                .status(400)
                .json({ ok: false, message: "Credenciales inválidas" });
        }

        // Comparar contraseña
        const esMatch = await bcrypt.compare(password, usuario.password);
        if (!esMatch) {
            return res
                .status(400)
                .json({ ok: false, message: "Credenciales inválidas" });
        }

        // Generar token
        const token = generarToken(usuario._id);

        return res.status(200).json({
            ok: true,
            message: "Login exitoso",
            user: {
                id: usuario._id,
                name: usuario.name,
                email: usuario.email,
            },
            token,
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ ok: false, message: "Error en servidor" });
    }
};

module.exports = {
    register,
    login,
};
