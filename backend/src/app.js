const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const registroRoutes = require('../routes/registroRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 💡 CORRECCIÓN: Montamos las rutas bajo el prefijo completo '/api/usuarios'.
// Ahora, cuando Postman envía DELETE /api/usuarios/1, Express lo encuentra.
app.use('/api/usuarios', registroRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en puerto 3000');
});
