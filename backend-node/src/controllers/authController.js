const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registrar = async (req, res, next) => {
  try {
    const { nombre, correo, contrasena, identificacion, telefono, fk_area, fecha_inicio, fecha_fin } = req.body;

    const missing = [];
    if (!nombre) missing.push('nombre');
    if (!correo) missing.push('correo');
    if (!contrasena) missing.push('contrasena');
    if (!identificacion) missing.push('identificacion (cédula)');
    if (!fk_area) missing.push('fk_area');

    if (missing.length > 0) {
      console.log('Body recibido:', req.body);
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios: ' + missing.join(', '), data: null });
    }

    const [existingUsers] = await pool.query(
      'SELECT id_usuario FROM usuario WHERE correo = ? OR identificacion = ?',
      [correo, identificacion]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'El correo o documento ya está registrado.', data: null });
    }

    const [roles] = await pool.query('SELECT id_rol FROM rol WHERE rol LIKE ?', ['%campesena%']);
    const fk_rol = roles.length > 0 ? roles[0].id_rol : 1; 

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    const estado = 'pendiente';
    const [result] = await pool.query(
      `INSERT INTO usuario (nombre, correo, contrasena, identificacion, telefono, fk_area, fk_rol, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, correo, hash, identificacion, telefono, fk_area, fk_rol, estado]
    );
    const id_usuario = result.insertId;

    if (fecha_inicio && fecha_fin) {
      await pool.query(
        `INSERT INTO contrato (fecha_inicio, fecha_fin, estado_contrato, fk_usuario) VALUES (?, ?, ?, ?)`,
        [fecha_inicio, fecha_fin, 'vigente', id_usuario]
      );
    }

    res.status(201).json({ success: true, message: 'Registro exitoso. Tu cuenta está pendiente de activación por un coordinador.', data: { id: id_usuario } });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son obligatorios', data: null });
    }

    const [users] = await pool.query(
      `SELECT u.*, r.rol AS rol_nombre 
       FROM usuario u
       LEFT JOIN rol r ON u.fk_rol = r.id_rol
       WHERE u.correo = ?`,
      [correo]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas', data: null });
    }

    const usuario = users[0];

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas', data: null });
    }

    if (usuario.estado === 'pendiente') {
      return res.status(403).json({ success: false, message: 'Tu cuenta aún está pendiente de activación por parte del coordinador.', data: null });
    }
    if (usuario.estado === 'inactivo') {
      return res.status(403).json({ success: false, message: 'Tu cuenta está inactiva. Contacta al coordinador.', data: null });
    }

    const payload = {
      id: usuario.id_usuario,
      rol: usuario.rol_nombre,
      estado: usuario.estado
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        usuario: {
          id: usuario.id_usuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol_nombre,
          estado: usuario.estado
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { registrar, login };
