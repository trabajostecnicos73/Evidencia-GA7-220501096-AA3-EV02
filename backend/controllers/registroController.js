const Usuario = require('../models/usuarioModel');
const bcrypt = require('bcrypt'); // 👈 Importamos bcrypt para el hashing y la verificación
const saltRounds = 10; // 👈 Número de rondas de sal: un valor estándar y seguro

// ----------------------------------------------------
// FUNCIÓN: Registrar un nuevo usuario (POST) - C (Create)
// ----------------------------------------------------
exports.registrarUsuario = (req, res) => {
    const datos = req.body;

    // 1. Validación de contraseñas
    if (datos.contraseña !== datos.confirmar) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }

    // 2. HASHEAR la contraseña antes de llamar al modelo
    // Esto es ASÍNCRONO, por lo que usamos bcrypt.hash()
    bcrypt.hash(datos.contraseña, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error al hashear la contraseña:', err);
            return res.status(500).json({ error: 'Error interno de servidor al encriptar.' });
        }
        
        // Sobreescribimos la contraseña en texto plano por su versión hasheada
        datos.contraseña = hash;
        
        // 3. Llama al modelo para insertar en la DB
        Usuario.registrar(datos, (err, resultado) => {
            if (err) {
                // Manejo de errores de la DB (ej. correo duplicado, cédula duplicada)
                console.error('Error al registrar usuario:', err);
                // Aquí podrías examinar el error.code para dar un mensaje más específico si es de duplicidad
                return res.status(500).json({ error: 'Error en el servidor al registrar.' });
            }
            res.status(200).json({ mensaje: 'Usuario registrado correctamente', id: resultado.insertId });
        });
    });
};

// ----------------------------------------------------
// FUNCIÓN: Iniciar sesión (POST)
// ----------------------------------------------------
exports.iniciarSesion = (req, res) => {
    const { correo, contraseña } = req.body;

    // 1. Buscar el usuario por correo
    Usuario.obtenerPorCorreo(correo, (err, resultados) => {
        if (err) {
            console.error('Error al buscar usuario por correo:', err);
            return res.status(500).json({ error: 'Error interno del servidor.' });
        }

        if (resultados.length === 0) {
            // No se encontró el usuario
            return res.status(401).json({ error: 'Credenciales inválidas (correo o contraseña).' });
        }

        const usuario = resultados[0];
        
        // 2. Comparar la contraseña ingresada con la hasheada en la DB
        bcrypt.compare(contraseña, usuario.contraseña, (err, coinciden) => {
            if (err) {
                console.error('Error al comparar contraseñas:', err);
                return res.status(500).json({ error: 'Error interno del servidor.' });
            }

            if (coinciden) {
                // Contraseña correcta: ¡Inicio de sesión exitoso!
                // *Nota: Aquí se implementaría la generación de un token JWT.*
                const usuarioInfo = { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo };
                res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario: usuarioInfo });
            } else {
                // Contraseña incorrecta
                res.status(401).json({ error: 'Credenciales inválidas (correo o contraseña).' });
            }
        });
    });
};

// ----------------------------------------------------
// FUNCIÓN: Obtener todos los usuarios (GET) - R (Read/All)
// ----------------------------------------------------
exports.obtenerUsuarios = (req, res) => {
    // Llama a una función en el modelo para ejecutar un SELECT *
    Usuario.obtenerTodos((err, resultados) => {
        if (err) {
            console.error('Error al obtener usuarios:', err);
            return res.status(500).json({ error: 'Error en el servidor al obtener usuarios.' });
        }
        
        // Si no hay errores, retorna el código 200 (OK) y la lista de resultados
        // Es buena práctica no devolver el hash de la contraseña.
        const usuariosSinContraseña = resultados.map(u => {
            const { contraseña, ...usuarioSinPass } = u;
            return usuarioSinPass;
        });
        res.status(200).json(usuariosSinContraseña);
    });
};

// ----------------------------------------------------
// FUNCIÓN: Obtener un usuario por ID (GET/:id) - R (Read/One)
// ----------------------------------------------------
exports.obtenerUsuarioPorId = (req, res) => {
    const id = req.params.id;
    
    // Llama a una función en el modelo para ejecutar un SELECT por ID
    Usuario.obtenerPorId(id, (err, resultados) => {
        if (err) {
            console.error(`Error al obtener usuario con ID ${id}:`, err);
            return res.status(500).json({ error: 'Error en el servidor al obtener el usuario.' });
        }

        if (resultados.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        
        // Si no hay errores, retorna el código 200 (OK) y el resultado
        const usuario = resultados[0];
        // Quita la contraseña antes de responder
        const { contraseña, ...usuarioSinPass } = usuario;
        res.status(200).json(usuarioSinPass);
    });
};

// ----------------------------------------------------
// FUNCIÓN: Actualizar un usuario por ID (PUT/:id) - U (Update)
// ----------------------------------------------------
exports.actualizarUsuario = (req, res) => {
    const id = req.params.id;
    const datos = req.body;
    
    // Si la contraseña está en los datos, ¡DEBE hashearse antes de la actualización!
    if (datos.contraseña) {
        // Validación de contraseñas
        if (datos.contraseña !== datos.confirmar) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden' });
        }

        // Hashear la nueva contraseña
        bcrypt.hash(datos.contraseña, saltRounds, (err, hash) => {
            if (err) {
                console.error('Error al hashear la nueva contraseña:', err);
                return res.status(500).json({ error: 'Error interno de servidor al encriptar la nueva contraseña.' });
            }
            
            datos.contraseña = hash;
            // Eliminar 'confirmar' del objeto para que no se intente guardar en la DB
            delete datos.confirmar; 
            
            // Llamar al modelo con la contraseña hasheada
            Usuario.actualizar(id, datos, manejarResultadoActualizacion(res));
        });
    } else {
        // Si la contraseña no está en los datos, actualiza directamente
        // Asegurarse de eliminar 'confirmar' por si acaso
        delete datos.confirmar; 
        Usuario.actualizar(id, datos, manejarResultadoActualizacion(res));
    }
};

// Función de utilidad para manejar la respuesta de la actualización
const manejarResultadoActualizacion = (res) => (err, resultado) => {
    if (err) {
        console.error('Error al actualizar usuario:', err);
        return res.status(500).json({ error: 'Error en el servidor al actualizar.' });
    }

    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado o no se realizaron cambios.' });
    }

    res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
};


// ----------------------------------------------------
// FUNCIÓN: Eliminar un usuario por ID (DELETE/:id) - D (Delete)
// ----------------------------------------------------
exports.eliminarUsuario = (req, res) => {
    const id = req.params.id;
    
    // Llama a una función en el modelo para ejecutar un DELETE
    Usuario.eliminar(id, (err, resultado) => {
        if (err) {
            console.error(`Error al eliminar usuario con ID ${id}:`, err);
            return res.status(500).json({ error: 'Error en el servidor al intentar eliminar.' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado para eliminar.' });
        }

        res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    });
};

// Nota: Estas funciones asumen que el archivo `../models/usuarioModel` tiene implementadas las funciones 
// `registrar`, `obtenerTodos`, `obtenerPorCorreo`, `obtenerPorId`, `actualizar` y `eliminar` que interactúan con la base de datos.