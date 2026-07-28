const express = require('express');
const { getAreas } = require('../controllers/areaController');

const router = express.Router();

// Endpoint público para que el frontend pueda cargar las áreas en el registro
router.get('/', getAreas);

module.exports = router;
