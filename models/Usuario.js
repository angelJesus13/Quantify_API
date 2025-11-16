const mongoose = require("mongoose");
const usuarioSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"], // [cite: 285]
        trim: true,
    },
    email: {
        type: String,
        required: [true, "El email es obligatorio"], // [cite: 289]
        unique: true, // [cite: 290]
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"], // [cite: 296]
        minlength: 6, // [cite: 297]
    },
    createdAt: {
        type: Date,
        default: Date.now, // [cite: 300]
    },
});
module.exports = mongoose.model("Usuario", usuarioSchema);