const mongoose = require("mongoose");

const LogroSchema = new mongoose.Schema({
    clave: { type: String, required: true, unique: true, uppercase: true },
    nombre: { type: String, required: true },
    descripcion: { type: String },
    meta: { type: Number, required: true }, 
    tipo: { 
        type: String, 
        required: true, 
        enum: ['EVENTO', 'CANTIDAD_EXITOS', 'CANTIDAD_FALLOS', 'CANTIDAD_CREADOS', 'RACHA'] 
    },
    usuarios_ganadores: { type: Number, default: 0 } 
}, { versionKey: false });

module.exports = mongoose.model("Logro", LogroSchema);