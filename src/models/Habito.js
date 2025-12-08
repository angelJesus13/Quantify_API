const mongoose = require("mongoose");

const HabitoSchema = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Usuario' },
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    tipo: { type: String, required: true, enum: ['cronometro', 'contador', 'check'], default: 'check' },
    meta_objetivo: { type: Number, required: true, default: 1 },
    meta_frecuencia: { type: Number, required: true, default: 1 },
    fecha_meta: { type: Date, required: true }
}, { versionKey: false });

module.exports = mongoose.model("Habito", HabitoSchema);