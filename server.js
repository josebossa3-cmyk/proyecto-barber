require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sirviendo archivos estáticos (Frontend)
app.use(express.static(path.join(__dirname, 'public')));
// También servimos la raíz por si no movemos los archivos HTML a public
app.use(express.static(__dirname));

// Rutas API
app.use('/api/admin', require('./routes/authRoutes'));
app.use('/api/turnos', require('./routes/turnoRoutes'));

// Sincronizar Base de Datos y arrancar servidor
sequelize.sync({ force: false })
  .then(async () => {
    console.log('Base de datos conectada.');
    
    // Crear admin por defecto si no existe
    const Admin = require('./models/Admin');
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      await Admin.create({ usuario: 'admin', clave: 'admin123' });
      console.log('Administrador por defecto (admin/admin123) creado.');
    }

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('Error al conectar con la base de datos:', err));
