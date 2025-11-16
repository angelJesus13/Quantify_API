const Habito = require('../models/Habito');
// const Progreso = require('../models/Progreso'); // (Se usará en la rama 'Progreso')

/**
 * @desc    Crear un nuevo hábito [cite: 59]
 * @route   POST /api/habitos
 * @access  Privado
 */
exports.crearHabito = async (req, res) => {
    try {
        const { nombre, tipo_medida, unidad, meta } = req.body;
        // req.user.id es inyectado por authMiddleware
        const usuario_id = req.user.id; 

        if (!nombre || !tipo_medida || !meta) {
            // Usamos el formato de respuesta del authController [cite: 198-202]
            return res.status(400).json({ ok: false, message: "Campos obligatorios faltantes" });
        }

        const habito = await Habito.create({
            usuario_id,
            nombre,
            tipo_medida,
            unidad: tipo_medida === 'numérico' ? unidad : undefined,
            meta
        });

        res.status(201).json({ ok: true, habito });

    } catch (error) {
        console.error("Error en crearHabito:", error);
        // Usamos el formato de respuesta del authController [cite: 231-232]
        res.status(500).json({ ok: false, message: "Error en servidor" });
    }
};

/**
 * @desc    Obtener todos los hábitos del usuario logueado [cite: 62]
 * @route   GET /api/habitos
 * @access  Privado
 */
exports.obtenerHabitos = async (req, res) => {
    try {
        const habitos = await Habito.find({ usuario_id: req.user.id });
        res.status(200).json({ ok: true, habitos });
    } catch (error) {
        console.error("Error en obtenerHabitos:", error);
        res.status(500).json({ ok: false, message: "Error en servidor" });
    }
};

/**
 * @desc    Actualizar un hábito [cite: 63]
 * @route   PUT /api/habitos/:id
 * @access  Privado
 */
exports.actualizarHabito = async (req, res) => {
    try {
        let habito = await Habito.findById(req.params.id);
        if (!habito) {
            return res.status(404).json({ ok: false, message: "Hábito no encontrado" });
        }

        // Verificar que el hábito pertenece al usuario
        if (habito.usuario_id.toString() !== req.user.id) {
            return res.status(401).json({ ok: false, message: "No autorizado" });
        }

        const habitoActualizado = await Habito.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ ok: true, habito: habitoActualizado });

    } catch (error) {
        console.error("Error en actualizarHabito:", error);
        res.status(500).json({ ok: false, message: "Error en servidor" });
    }
};

/**
 * @desc    Eliminar un hábito [cite: 64]
 * @route   DELETE /api/habitos/:id
 * @access  Privado
 */
exports.eliminarHabito = async (req, res) => {
    try {
        const habito = await Habito.findById(req.params.id);
        if (!habito) {
            return res.status(404).json({ ok: false, message: "Hábito no encontrado" });
        }

        if (habito.usuario_id.toString() !== req.user.id) {
            return res.status(401).json({ ok: false, message: "No autorizado" });
        }

        // Lógica para eliminar el progreso asociado [cite: 64]
        // (La siguiente línea se descomentará en la rama 'Progreso')
        // await Progreso.deleteMany({ id_hábito: req.params.id });

        await Habito.findByIdAndDelete(req.params.id);

        res.status(200).json({ ok: true, message: "Hábito eliminado" });

    } catch (error) {
        console.error("Error en eliminarHabito:", error);
        res.status(500).json({ ok: false, message: "Error en servidor" });
    }
};