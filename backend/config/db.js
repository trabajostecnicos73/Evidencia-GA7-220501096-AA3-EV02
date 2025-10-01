const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'PasswordMySQL', // tu contraseña
  database: 'smartparking'
});

conn.connect(err => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});

module.exports = conn;
