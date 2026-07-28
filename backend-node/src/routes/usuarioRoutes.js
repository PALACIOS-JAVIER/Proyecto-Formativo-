const express = require('express');
const { getUsuarios, getPerfil, activarUsuario, desactivarUsuario } = require('../controllers/usuarioController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

const router = express.Router();

// Todas las rutas de usuario requieren estar autenticado
router.use(verificarToken);

// Solo coordinadores pueden listar todos los usuarios (y filtrar por estado)
router.get('/', verificarRol(['coordinador', 'admin']), getUsuarios);

// Obtener perfil propio
router.get('/:id', getPerfil);

// Solo coordinadores pueden activar/desactivar
router.patch('/:id/activar', verificarRol(['coordinador', 'admin']), activarUsuario);
router.patch('/:id/desactivar', verificarRol(['coordinador', 'admin']), desactivarUsuario);

module.exports = router;
