const db = require('../config/db'); // Módulo de conexión a la base de datos (MySQL)

const UsuarioModel = {
    // ----------------------------------------------------
    // FUNCIÓN POST: Registrar un nuevo usuario (C - Create)
    // ----------------------------------------------------
    registrar: (datos, callback) => {
        const sql = `INSERT INTO usuarios (nombre, apellido, cedula, telefono, correo, contraseña) VALUES (?, ?, ?, ?, ?, ?)`;
        
        db.query(sql, [
            datos.nombre,
            datos.apellido,
            datos.cedula,
            datos.telefono,
            datos.correo,
            datos.contraseña // ¡Ya hasheada desde el controlador!
        ], callback);
    },

    // ----------------------------------------------------
    // FUNCIÓN GET: Obtener todos los usuarios (R - Read All)
    // ----------------------------------------------------
    obtenerTodos: (callback) => {
        // Selecciona todos los campos, INCLUYENDO la contraseña (hash), ya que el controlador se encarga de quitarla
        // si es necesario (ej. para el GET ALL), o usarla (ej. para el POST Login).
        const sql = `SELECT * FROM usuarios`; 
        db.query(sql, callback);
    },

    // ----------------------------------------------------
    // FUNCIÓN GET: Obtener usuario por Correo (Para Login)
    // ----------------------------------------------------
    obtenerPorCorreo: (correo, callback) => {
        // Necesitamos la contraseña (hash) para compararla en el controlador (bcrypt.compare)
        const sql = `SELECT * FROM usuarios WHERE correo = ?`; 
        db.query(sql, [correo], callback);
    },

    // ----------------------------------------------------
    // FUNCIÓN GET: Obtener un usuario por ID (R - Read One)
    // ----------------------------------------------------
    obtenerPorId: (id, callback) => {
        // Selecciona todos los campos, incluyendo el hash de la contraseña si el controlador lo necesita.
        const sql = `SELECT * FROM usuarios WHERE id = ?`;
        db.query(sql, [id], callback);
    },
    
    // ----------------------------------------------------
    // FUNCIÓN PUT: Actualizar un usuario (U - Update)
    // ----------------------------------------------------
    actualizar: (id, datos, callback) => {
        // Esta función construye dinámicamente la consulta SET
        const campos = [];
        const valores = [];

        // Itera sobre las claves del objeto 'datos' para construir la consulta de forma segura
        for (const clave in datos) {
            // Se excluye 'confirmar' por si acaso
            if (datos.hasOwnProperty(clave) && clave !== 'confirmar') {
                campos.push(`${clave} = ?`);
                valores.push(datos[clave]);
            }
        }

        if (campos.length === 0) {
            // Si no hay campos para actualizar, llama al callback sin error
            return callback(null, { affectedRows: 0 }); 
        }

        const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
        valores.push(id); // Añade el ID al final del array de valores para el WHERE
        
        db.query(sql, valores, callback);
    },
    
    // ----------------------------------------------------
    // FUNCIÓN DELETE: Eliminar un usuario (D - Delete)
    // ----------------------------------------------------
    eliminar: (id, callback) => {
        const sql = `DELETE FROM usuarios WHERE id = ?`;
        db.query(sql, [id], callback);
    }
};

module.exports = UsuarioModel;