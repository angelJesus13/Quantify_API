const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Conectar a la BD
connectDB();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/api/health", (req, res) => {
    res.json({ ok: true, message: "API Quantify funcionando 🚀" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
