const mongoose = require("mongoose");

const ProgresoSchema = new mongoose.Schema({
    id_habito: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'Habito' 
    },
    fecha_inicio: { 
        type: Date, 
        default: Date.now 
    },
    fecha_fin: { 
        type: Date, 
        required: true 
    },
    total_ejecuciones: { 
        type: Number, 
        default: 0 
    },
    contador_exitos: { 
        type: Number, 
        default: 0 
    },
    contador_fallos: { 
        type: Number, 
        default: 0 
    },
    tiempo_transcurrido: { 
        type: String, 
        default: "00:00:00" 
    },
    porcentaje: { 
        type: Number, 
        default: 0 
    },
    estado: { 
        type: String, 
        required: true, 
        enum: ['en_proceso', 'pausa', 'realizado', 'no_realizado', 'cancelado'], 
        default: 'en_proceso' 
    }
}, { versionKey: false });

module.exports = mongoose.model("Progreso", ProgresoSchema);