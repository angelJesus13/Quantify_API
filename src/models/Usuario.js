const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: true, 
        trim: true 
    },
    nombre_usuario: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    fecha_nacimiento: { 
        type: Date, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    fecha_registro: { 
        type: Date, 
        default: Date.now 
    }
}, { versionKey: false });

module.exports = mongoose.model("Usuario", usuarioSchema);