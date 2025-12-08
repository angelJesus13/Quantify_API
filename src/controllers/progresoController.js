const Progreso = require('../models/Progreso');
const Habito = require('../models/Habito');
const Usuario = require('../models/Usuario');
const { verificarLogros } = require('./logroController');

const crearProgresoInicial = async (habito) => {
    try {
        await Progreso.create({
            id_habito: habito._id,
            fecha_fin: habito.fecha_meta
        });
    } catch (error) {
        console.log(error);
    }
};

const registrarEjecucion = async (req, res) => {
    try {
        const { id_progreso, valor_realizado } = req.body; 
        
        const progreso = await Progreso.findById(id_progreso);
        if (!progreso) return res.status(404).json({ message: "No existe" });
        if (['realizado', 'no_realizado', 'cancelado'].includes(progreso.estado)) {
            return res.status(400).json({ message: "Finalizado" });
        }

        const habito = await Habito.findById(progreso.id_habito);
        progreso.total_ejecuciones += 1;

        let esExito = false;
        if (habito.tipo === 'cronometro' || habito.tipo === 'contador') {
            if (Number(valor_realizado) >= habito.meta_objetivo) esExito = true;
        } else {
            if (Number(valor_realizado) > 0) esExito = true;
        }

        // Actualizar estadísticas de usuario
        const usuario = await Usuario.findById(habito.usuario_id);
        let tipoLogroA_Verificar = '';

        if (esExito) {
            progreso.contador_exitos += 1;
            usuario.estadisticas.total_exitos += 1;
            tipoLogroA_Verificar = 'CANTIDAD_EXITOS';
        } else {
            progreso.contador_fallos += 1;
            usuario.estadisticas.total_fallos += 1;
            tipoLogroA_Verificar = 'CANTIDAD_FALLOS';
        }
        await usuario.save();

        // Verificar Logros
        const logrosNuevos = await verificarLogros(habito.usuario_id, tipoLogroA_Verificar);

        let porc = (progreso.contador_exitos / habito.meta_frecuencia) * 100;
        if (porc >= 100) {
            porc = 100;
            progreso.estado = 'realizado';
        }
        progreso.porcentaje = Math.round(porc);

        await progreso.save();

        res.status(200).json({ 
            ok: true, 
            resultado: esExito ? "Exito" : "Fallo", 
            progreso,
            nuevos_logros: logrosNuevos 
        });

    } catch (error) {
        res.status(500).json({ ok: false, message: "Error server" });
    }
};

const obtenerDashboard = async (req, res) => {
    try {
        const habitos = await Habito.find({ usuario_id: req.user.id });
        const ids = habitos.map(h => h._id);
        
        const progresos = await Progreso.find({ 
            id_habito: { $in: ids },
            estado: { $nin: ['cancelado'] } 
        }).populate('id_habito');

        const ahora = new Date();
        for (let p of progresos) {
            if (p.estado === 'en_proceso' && ahora > p.fecha_fin) {
                p.estado = 'no_realizado';
                await p.save();
            }
        }

        res.status(200).json({ ok: true, dashboard: progresos });
    } catch (error) {
        res.status(500).json({ ok: false, message: "Error server" });
    }
};

module.exports = { crearProgresoInicial, registrarEjecucion, obtenerDashboard };