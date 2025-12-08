require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const habitoRoutes = require("./src/routes/habitoRoutes");
const progresoRoutes = require("./src/routes/progresoRoutes");
const logroRoutes = require("./src/routes/logroRoutes");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/habitos", habitoRoutes);
app.use("/api/progreso", progresoRoutes);
app.use("/api/logros", logroRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Run on ${PORT}`));