require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db"); //

// --- RUTAS FUSIONADAS ---
// Importa las rutas de tu compañero
const authRoutes = require("./routes/authRoutes"); //
// Importa TUS rutas
const habitoRoutes = require("./routes/habitoRoutes"); 
// -------------------------

connectDB(); //

const app = express();

// Middlewares globales
app.use(cors()); //
app.use(express.json()); //

// --- CONEXIÓN DE RUTAS FUSIONADA ---
app.use("/api/auth", authRoutes); //
app.use("/api/habitos", habitoRoutes); // Tu ruta
// ---------------------------------

// Ruta de prueba
app.get("/api/health", (req, res) => { //
    res.json({ ok: true, message: "API Quantify funcionando 🚀" }); //
});

// Puerto desde .env o 3000 por defecto
const PORT = process.env.PORT || 3000; //

app.listen(PORT, () => { //
    console.log(`Servidor corriendo en puerto ${PORT}`); //
});