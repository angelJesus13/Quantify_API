const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const register = async (req, res) => {
    try {
        const { nombre, nombre_usuario, email, fecha_nacimiento, password, repetirPassword } = req.body;

        if (!nombre || !nombre_usuario || !email || !fecha_nacimiento || !password || !repetirPassword) {
            return res.status(400).json({ ok: false, message: "Faltan datos" });
        }

        if (password !== repetirPassword) {
            return res.status(400).json({ ok: false, message: "Contraseñas no coinciden" });
        }

        const existe = await Usuario.findOne({ $or: [{ email }, { nombre_usuario }] });
        if (existe) {
            return res.status(400).json({ ok: false, message: "Usuario o Email ya registrado" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = await Usuario.create({
            nombre,
            nombre_usuario,
            email,
            fecha_nacimiento: new Date(fecha_nacimiento),
            password: hashedPassword
        });

        const token = jwt.sign({ id: nuevoUsuario._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ ok: true, token, user: { id: nuevoUsuario._id, user: nuevoUsuario.nombre_usuario } });

    } catch (error) {
        res.status(500).json({ ok: false, message: "Error servidor" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ ok: false, message: "Credenciales mal" });

        const match = await bcrypt.compare(password, usuario.password);
        if (!match) return res.status(400).json({ ok: false, message: "Credenciales mal" });

        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ ok: true, token, user: { id: usuario._id, user: usuario.nombre_usuario } });

    } catch (error) {
        res.status(500).json({ ok: false, message: "Error servidor" });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = await Usuario.findByIdAndDelete(id);
        if (!usuario) return res.status(404).json({ ok: false, message: "No encontrado" });
        res.status(200).json({ ok: true, message: "Eliminado" });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

const obtenerPorUsuario = async (req, res) => {
    try {
        const { nombre_usuario } = req.params;
        const usuario = await Usuario.findOne({ nombre_usuario }).select("-password");
        if (!usuario) return res.status(404).json({ ok: false });
        res.status(200).json({ ok: true, user: usuario });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

module.exports = { register, login, eliminarUsuario, obtenerPorUsuario };