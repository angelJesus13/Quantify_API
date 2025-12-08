const express = require("express");
const { register, login, eliminarUsuario, obtenerPorUsuario } = require("../controllers/authController");
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.delete("/:id", eliminarUsuario);
router.get("/:nombre_usuario", obtenerPorUsuario);
module.exports = router;