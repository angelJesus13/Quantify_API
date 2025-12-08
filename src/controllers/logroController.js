const Logro = require('../models/Logro');
const Usuario = require('../models/Usuario');

const crearLogrosPorDefecto = async (req, res) => {
    try {
        const existen = await Logro.countDocuments();
        if (existen > 0) return res.status(400).json({ message: "Catálogo ya inicializado" });

        const lista = [
            // 1. Registro (Automático)
            { clave: 'BIENVENIDA', nombre: 'El Comienzo', descripcion: 'Crea tu cuenta', meta: 1, tipo: 'EVENTO' },
            // 2. Creación
            { clave: 'ARQUITECTO', nombre: 'Primeros Pasos', descripcion: 'Crea tu primer hábito', meta: 1, tipo: 'CANTIDAD_CREADOS' },
            { clave: 'PLANIFICADOR', nombre: 'Mente Ocupada', descripcion: 'Crea 5 hábitos', meta: 5, tipo: 'CANTIDAD_CREADOS' },
            // 3. Éxitos
            { clave: 'VICTORIA_1', nombre: 'Sabor a Gloria', descripcion: 'Completa 1 sesión con éxito', meta: 1, tipo: 'CANTIDAD_EXITOS' },
            { clave: 'VICTORIA_10', nombre: 'En Racha', descripcion: 'Completa 10 sesiones con éxito', meta: 10, tipo: 'CANTIDAD_EXITOS' },
            { clave: 'VICTORIA_50', nombre: 'Imparable', descripcion: 'Completa 50 sesiones con éxito', meta: 50, tipo: 'CANTIDAD_EXITOS' },
            // 4. Fallos (Variedad)
            { clave: 'APRENDIZ', nombre: 'Errar es Humano', descripcion: 'Registra tu primer fallo', meta: 1, tipo: 'CANTIDAD_FALLOS' },
            { clave: 'PERSISTENTE', nombre: 'Caer y Levantarse', descripcion: 'Registra 5 fallos', meta: 5, tipo: 'CANTIDAD_FALLOS' },
            // 5. Rachas de Login
            { clave: 'CONSTANCIA_3', nombre: 'Comprometido', descripcion: 'Inicia sesión 3 días seguidos', meta: 3, tipo: 'RACHA' },
            { clave: 'CONSTANCIA_7', nombre: 'Hábito de Hierro', descripcion: 'Inicia sesión 7 días seguidos', meta: 7, tipo: 'RACHA' }
        ];

        await Logro.insertMany(lista);
        res.status(201).json({ ok: true, message: "10 Logros creados correctamente" });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

const verificarLogros = async (usuarioId, tipoEvento) => {
    try {
        const usuario = await Usuario.findById(usuarioId).populate('logros_desbloqueados');
        if (!usuario) return;

        // Buscamos logros de ese tipo (Ej: solo los de CREACION o solo los de RACHA)
        const logrosPosibles = await Logro.find({ tipo: tipoEvento });
        let nuevos = [];

        for (let logro of logrosPosibles) {
            // Si ya lo tiene, saltar
            if (usuario.logros_desbloqueados.some(l => l._id.toString() === logro._id.toString())) continue;

            let desbloqueado = false;

            // Switch para validar según el tipo
            switch (tipoEvento) {
                case 'EVENTO': // Para el registro
                    desbloqueado = true; 
                    break;
                case 'CANTIDAD_CREADOS':
                    if (usuario.estadisticas.total_habitos_creados >= logro.meta) desbloqueado = true;
                    break;
                case 'CANTIDAD_EXITOS':
                    if (usuario.estadisticas.total_exitos >= logro.meta) desbloqueado = true;
                    break;
                case 'CANTIDAD_FALLOS':
                    if (usuario.estadisticas.total_fallos >= logro.meta) desbloqueado = true;
                    break;
                case 'RACHA':
                    if (usuario.estadisticas.racha_login_actual >= logro.meta) desbloqueado = true;
                    break;
            }

            if (desbloqueado) {
                // 1. Asignar al usuario
                usuario.logros_desbloqueados.push(logro._id);
                nuevos.push(logro.nombre);
                
                // 2. Aumentar contador global del logro
                await Logro.findByIdAndUpdate(logro._id, { $inc: { usuarios_ganadores: 1 } });
            }
        }

        if (nuevos.length > 0) {
            usuario.contador_logros_ganados = usuario.logros_desbloqueados.length;
            await usuario.save();
        }
        
        return nuevos;

    } catch (error) {
        console.error(error);
    }
};

const obtenerMisLogros = async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).populate('logros_desbloqueados');
        res.status(200).json({ 
            ok: true, 
            ganados: usuario.contador_logros_ganados, 
            lista: usuario.logros_desbloqueados 
        });
    } catch (error) {
        res.status(500).json({ ok: false });
    }
};

module.exports = { crearLogrosPorDefecto, verificarLogros, obtenerMisLogros };