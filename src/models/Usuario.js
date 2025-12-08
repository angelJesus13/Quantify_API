const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    nombre_usuario: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    fecha_nacimiento: { type: Date, required: true },
    password: { type: String, required: true },
    fecha_registro: { type: Date, default: Date.now },

    estadisticas: {
        total_exitos: { type: Number, default: 0 },
        total_fallos: { type: Number, default: 0 },
        total_habitos_creados: { type: Number, default: 0 },
        racha_login_actual: { type: Number, default: 0 },
        ultimo_login: { type: Date, default: Date.now }
    },

    logros_desbloqueados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Logro' }],
    contador_logros_ganados: { type: Number, default: 0 }

}, { versionKey: false });

module.exports = mongoose.model("Usuario", usuarioSchema);