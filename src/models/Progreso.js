const mongoose = require("mongoose");

const ProgresoSchema = new mongoose.Schema({
    id_habito: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Habito' },
    fecha_inicio: { type: Date, default: Date.now },
    fecha_fin: { type: Date, required: true },
    total_ejecuciones: { type: Number, default: 0 },
    contador_exitos: { type: Number, default: 0 },
    contador_fallos: { type: Number, default: 0 },
    porcentaje: { type: Number, default: 0 },
    estado: { type: String, required: true, enum: ['en_proceso', 'pausa', 'realizado', 'no_realizado', 'cancelado'], default: 'en_proceso' }
}, { 
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

ProgresoSchema.virtual('tiempo_transcurrido_auto').get(function() {
    const ahora = new Date();
    const fin = (this.estado === 'en_proceso') ? ahora : this.fecha_fin;
    let diff = Math.max(0, fin - this.fecha_inicio);
    
    const segundosTotales = Math.floor(diff / 1000);
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    return [
        horas.toString().padStart(2, '0'),
        minutos.toString().padStart(2, '0'),
        segundos.toString().padStart(2, '0')
    ].join(':');
});

module.exports = mongoose.model("Progreso", ProgresoSchema);