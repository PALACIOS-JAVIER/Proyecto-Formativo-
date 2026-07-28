const pool = require('../config/db');

const getAreas = async (req, res, next) => {
  try {
    const [areas] = await pool.query('SELECT id_area AS id, nombre_area AS nombre FROM areas');
    res.json({ success: true, message: 'Áreas obtenidas correctamente', data: areas });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAreas };
