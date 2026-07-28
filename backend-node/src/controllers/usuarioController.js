const pool = require('../config/db');

const getUsuarios = async (req, res, next) => {
  try {
    const { estado } = req.query;
    
    let query = `
      SELECT u.id_usuario AS id, u.nombre, u.correo, u.identificacion, u.telefono, u.estado, r.rol AS rol_nombre, a.nombre_area as area_nombre 
      FROM usuario u
      LEFT JOIN rol r ON u.fk_rol = r.id_rol
      LEFT JOIN areas a ON u.fk_area = a.id_area
    `;
    let params = [];

    if (estado) {
      query += ' WHERE u.estado = ?';
      params.push(estado);
    }

    const [usuarios] = await pool.query(query, params);

    res.json({ success: true, message: 'Usuarios obtenidos', data: usuarios });
  } catch (error) {
    next(error);
  }
};

const getPerfil = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [users] = await pool.query(
      `SELECT u.id_usuario AS id, u.nombre, u.correo, u.identificacion, u.telefono, u.estado, r.rol AS rol_nombre, a.nombre_area AS area_nombre, c.fecha_inicio
       FROM usuario u
       LEFT JOIN rol r ON u.fk_rol = r.id_rol
       LEFT JOIN areas a ON u.fk_area = a.id_area
       LEFT JOIN contrato c ON u.id_usuario = c.fk_usuario
       WHERE u.id_usuario = ?`,
      [id]
    );

    if (users.length === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado', data: null });

    res.json({ success: true, message: 'Perfil obtenido', data: users[0] });
  } catch (error) {
    next(error);
  }
};

const actualizarEstado = async (req, res, next, nuevoEstado) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('UPDATE usuario SET estado = ? WHERE id_usuario = ?', [nuevoEstado, id]);

    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Usuario no encontrado', data: null });

    res.json({ success: true, message: `Usuario ${nuevoEstado} correctamente`, data: { id, estado: nuevoEstado } });
  } catch (error) {
    next(error);
  }
};

const activarUsuario = (req, res, next) => actualizarEstado(req, res, next, 'activo');
const desactivarUsuario = (req, res, next) => actualizarEstado(req, res, next, 'inactivo');

module.exports = { getUsuarios, getPerfil, activarUsuario, desactivarUsuario };
