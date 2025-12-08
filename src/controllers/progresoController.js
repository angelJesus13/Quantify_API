const Progreso = require('../models/Progreso');
const Habito = require('../models/Habito');

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

        if (esExito) progreso.contador_exitos += 1;
        else progreso.contador_fallos += 1;

        let porc = (progreso.contador_exitos / habito.meta_frecuencia) * 100;
        if (porc >= 100) {
            porc = 100;
            progreso.estado = 'realizado';
        }
        progreso.porcentaje = Math.round(porc);

        await progreso.save();

        res.status(200).json({ ok: true, resultado: esExito ? "Exito" : "Fallo", progreso });

    } catch (error) {
        res.status(500).json({ ok: false, message: "Error server" });
    }
};

const obtenerDashboard = async (req, res) => {
    try {
        const usuario_id = req.user.id;
        const habitos = await Habito.find({ usuario_id });
        const ids = habitos.map(h => h._id);
        
        const progresos = await Progreso.find({ 
            id_habito: { $in: ids },
            estado: { $nin: ['cancelado'] } 
        }).populate('id_habito');

        for (let p of progresos) {
            if (p.estado === 'en_proceso') {
                const ahora = new Date().getTime();
                const inicio = new Date(p.fecha_inicio).getTime();
                const diff = ahora - inicio;

                const horas = Math.floor(diff / (1000 * 60 * 60));
                const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const segundos = Math.floor((diff % (1000 * 60)) / 1000);

                const hh = horas.toString().padStart(2, '0');
                const mm = minutos.toString().padStart(2, '0');
                const ss = segundos.toString().padStart(2, '0');

                p.tiempo_transcurrido = `${hh}:${mm}:${ss}`;
                
                await p.save();
            }
        }

        res.status(200).json({ ok: true, dashboard: progresos });
    } catch (error) {
        res.status(500).json({ ok: false, message: "Error server" });
    }
};

module.exports = { crearProgresoInicial, registrarEjecucion, obtenerDashboard };