const express = require('express');
const { crearLogrosPorDefecto, obtenerMisLogros } = require('../controllers/logroController');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/seed', crearLogrosPorDefecto);
router.get('/mis-logros', auth, obtenerMisLogros);

module.exports = router;