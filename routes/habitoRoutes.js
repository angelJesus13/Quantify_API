const express = require('express');
const router = express.Router();
const {
    crearHabito,
    obtenerHabitos,
    actualizarHabito,
    eliminarHabito
} = require('../controllers/habitoController');

// 1. IMPORTAMOS EL MIDDLEWARE
const authMiddleware = require('../middleware/authMiddleware');

// 2. LÍNEA DE DEPURACIÓN
console.log("Valor de authMiddleware importado:", authMiddleware);

// 3. ESTA ES LA LÍNEA 14 (o cerca) QUE DA EL ERROR
// Si la línea de arriba imprime 'undefined', el problema es la
// ruta de importación o el archivo 'authMiddleware.js'.
router.use(authMiddleware);

// Rutas /api/habitos
router.route('/')
    .post(crearHabito)
    .get(obtenerHabitos);

// Rutas /api/habitos/:id
router.route('/:id')
    .put(actualizarHabito)
    .delete(eliminarHabito);

module.exports = router;