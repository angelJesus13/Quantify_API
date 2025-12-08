const Habito = require('../models/Habito');
const Progreso = require('../models/Progreso');
const Usuario = require('../models/Usuario');
const { crearProgresoInicial } = require('./progresoController');
const { verificarLogros } = require('./logroController');

const crearHabito = async (req, res) => {
    try {
        let { nombre, descripcion, tipo, meta_objetivo, meta_frecuencia, fecha_meta } = req.body;

        if (!nombre || !tipo || !fecha_meta) return res.status(400).json({ ok: false, message: "Faltan campos" });

        if (tipo === 'check') {
            meta_objetivo = 1;
            if(!meta_frecuencia) meta_frecuencia = 1;
        } else {
            if (!meta_objetivo || !meta_frecuencia) return res.status(400).json({ ok: false, message: "Faltan metas" });
        }

        const nuevoHabito = await Habito.create({
            usuario_id: req.user.id,
            nombre,
            descripcion,
            tipo,
            meta_objetivo,
            meta_frecuencia,
            fecha_meta
        });

        await crearProgresoInicial(nuevoHabito);

        // Actualizar Estadística y Verificar Logro
        const usuario = await Usuario.findById(req.user.id);
        usuario.estadisticas.total_habitos_creados += 1;
        await usuario.save();
        
        const logrosNuevos = await verificarLogros(req.user.id, 'CANTIDAD_CREADOS');

        res.status(201).json({ ok: true, habito: nuevoHabito, nuevos_logros: logrosNuevos });

    } catch (error) {
        res.status(500).json({ ok: false, message: "Error server" });
    }
};

const obtenerHabitos = async (req, res) => {
    try {
        const habitos = await Habito.find({ usuario_id: req.user.id });
        res.status(200).json({ ok: true, habitos });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

const actualizarHabito = async (req, res) => {
    try {
        const habito = await Habito.findOne({ _id: req.params.id, usuario_id: req.user.id });
        if (!habito) return res.status(404).json({ ok: false });

        const actualizado = await Habito.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({ ok: true, habito: actualizado });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

const eliminarHabito = async (req, res) => {
    try {
        const habito = await Habito.findOne({ _id: req.params.id, usuario_id: req.user.id });
        if (!habito) return res.status(404).json({ ok: false });

        await Progreso.deleteMany({ id_habito: req.params.id });
        await Habito.findByIdAndDelete(req.params.id);
        res.status(200).json({ ok: true });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

module.exports = { crearHabito, obtenerHabitos, actualizarHabito, eliminarHabito };