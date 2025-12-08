const Habito = require('../models/Habito');
const Progreso = require('../models/Progreso');
const { crearProgresoInicial } = require('./progresoController');

const crearHabito = async (req, res) => {
    try {
        let { nombre, descripcion, tipo, meta_objetivo, meta_frecuencia, fecha_meta } = req.body;

        if (!nombre || !tipo || !fecha_meta) {
            return res.status(400).json({ ok: false, message: "Faltan campos" });
        }

        if (tipo === 'check') {
            meta_objetivo = 1;
            if(!meta_frecuencia) meta_frecuencia = 1;
        } else {
            if (!meta_objetivo || !meta_frecuencia) {
                return res.status(400).json({ ok: false, message: "Faltan metas" });
            }
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

        res.status(201).json({ ok: true, habito: nuevoHabito });

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
        const { id } = req.params;
        const habito = await Habito.findOne({ _id: id, usuario_id: req.user.id });
        if (!habito) return res.status(404).json({ ok: false });

        const actualizado = await Habito.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json({ ok: true, habito: actualizado });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

const eliminarHabito = async (req, res) => {
    try {
        const { id } = req.params;
        const habito = await Habito.findOne({ _id: id, usuario_id: req.user.id });
        if (!habito) return res.status(404).json({ ok: false });

        await Progreso.deleteMany({ id_habito: id });
        await Habito.findByIdAndDelete(id);
        res.status(200).json({ ok: true, message: "Eliminado" });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

module.exports = { crearHabito, obtenerHabitos, actualizarHabito, eliminarHabito };