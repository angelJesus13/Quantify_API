const express = require('express');
const { registrarEjecucion, obtenerDashboard } = require('../controllers/progresoController');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();
router.use(auth);
router.get('/dashboard', obtenerDashboard);
router.post('/registrar', registrarEjecucion);
module.exports = router;