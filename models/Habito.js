const mongoose = require("mongoose");

const MetaSchema = new mongoose.Schema({
    tipo: { 
        type: String, 
        enum: ['diaria', 'semanal', 'mensual'], // [cite: 337]
        default: 'diaria' 
    },
    cantidad: { 
        type: Number, 
        default: 1 
    }
}, { _id: false });

const HabitoSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Usuario' // [cite: 379]
    },
    nombre: {
        type: String,
        required: [true, 'El nombre del hábito es obligatorio'],
        trim: true // [cite: 380]
    },
    tipo_medida: {
        type: String,
        required: true,
        enum: ['binario', 'numérico'] // [cite: 335, 381]
    },
    unidad: {
        type: String,
        required: function() { return this.tipo_medida === 'numérico'; },
        trim: true
    },
    meta: {
        type: MetaSchema,
        required: true // [cite: 384]
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Habito", HabitoSchema);