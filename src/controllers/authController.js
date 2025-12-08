const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");
const { verificarLogros } = require('./logroController');

const register = async (req, res) => {
    try {
        const { nombre, nombre_usuario, email, fecha_nacimiento, password, repetirPassword } = req.body;

        if (!nombre || !nombre_usuario || !email || !fecha_nacimiento || !password || !repetirPassword) {
            return res.status(400).json({ ok: false, message: "Faltan datos" });
        }

        const fechaNac = new Date(fecha_nacimiento);
        const anio = fechaNac.getFullYear();
        const hoy = new Date();

        if (isNaN(fechaNac.getTime())) return res.status(400).json({ ok: false, message: "Fecha inválida" });
        if (fechaNac > hoy || anio < 1900) return res.status(400).json({ ok: false, message: "Fecha no válida" });
        if (password !== repetirPassword) return res.status(400).json({ ok: false, message: "Contraseñas no coinciden" });

        const existe = await Usuario.findOne({ $or: [{ email }, { nombre_usuario }] });
        if (existe) return res.status(400).json({ ok: false, message: "Usuario o Email ya registrado" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const nuevoUsuario = await Usuario.create({
            nombre,
            nombre_usuario,
            email,
            fecha_nacimiento: fechaNac,
            password: hashedPassword
        });

        // LOGRO AUTOMÁTICO DE BIENVENIDA
        await verificarLogros(nuevoUsuario._id, 'EVENTO');

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

        // Lógica de Racha
        const hoy = new Date();
        const ultimo = new Date(usuario.estadisticas.ultimo_login);
        const d1 = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const d2 = new Date(ultimo.getFullYear(), ultimo.getMonth(), ultimo.getDate());
        const diff = (d1 - d2) / (1000 * 60 * 60 * 24);

        if (diff === 1) usuario.estadisticas.racha_login_actual += 1;
        else if (diff > 1) usuario.estadisticas.racha_login_actual = 1;

        usuario.estadisticas.ultimo_login = hoy;
        await usuario.save();

        // Verificar Logro de Racha
        const logrosNuevos = await verificarLogros(usuario._id, 'RACHA');

        const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        
        res.status(200).json({ 
            ok: true, 
            token, 
            user: { id: usuario._id },
            nuevos_logros: logrosNuevos 
        });

    } catch (error) {
        res.status(500).json({ ok: false, message: "Error servidor" });
    }
};

const eliminarUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) return res.status(404).json({ ok: false });
        res.status(200).json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

const obtenerPorUsuario = async (req, res) => {
    try {
        const usuario = await Usuario.findOne({ nombre_usuario: req.params.nombre_usuario }).select("-password");
        if (!usuario) return res.status(404).json({ ok: false });
        res.status(200).json({ ok: true, user: usuario });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

module.exports = { register, login, eliminarUsuario, obtenerPorUsuario };