const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');

exports.login = async (req, res) => {
  try {
    const { usuario, clave } = req.body;
    
    // Find admin
    const admin = await Admin.findOne({ where: { usuario } });
    
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Since the previous system didn't seem to use bcrypt (based on "admin123" literal), we'll do a simple check first,
    // but recommend bcrypt for production
    const isMatch = (clave === admin.clave); // or await bcrypt.compare(clave, admin.clave);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, usuario: admin.usuario },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ success: true, token, message: 'Login exitoso' });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
