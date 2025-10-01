const express = require('express');
const router = express.Router();
// 💡 Volvemos al nombre original: 'registroController'
const registroController = require('../controllers/registroController'); 

// =========================================================
// RUTAS DE AUTENTICACIÓN (LOGIN/REGISTRO)
// =========================================================

// RUTA POST (Crear/Registrar) - C de CRUD
// URL: [BASE_URL]/api/usuarios/registro
router.post('/registro', registroController.registrarUsuario);

// RUTA POST (Iniciar Sesión)
// URL: [BASE_URL]/api/usuarios/login
router.post('/login', registroController.iniciarSesion);

// =========================================================
// RUTAS CRUD DE USUARIOS
// =========================================================

// RUTA GET (Leer/Obtener TODOS) - R de CRUD
// URL: [BASE_URL]/api/usuarios
router.get('/', registroController.obtenerUsuarios); 

// RUTA GET (Leer/Obtener UNO por ID) - R de CRUD
// URL: [BASE_URL]/api/usuarios/:id
router.get('/:id', registroController.obtenerUsuarioPorId);

// RUTA PUT (Actualizar por ID) - U de CRUD
// URL: [BASE_URL]/api/usuarios/:id
router.put('/:id', registroController.actualizarUsuario);

// RUTA DELETE (Eliminar por ID) - D de CRUD
// URL: [BASE_URL]/api/usuarios/:id
router.delete('/:id', registroController.eliminarUsuario);


module.exports = router;