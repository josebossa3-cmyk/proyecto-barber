const express = require('express');
const router = express.Router();
const turnoController = require('../controllers/turnoController');
const jwt = require('jsonwebtoken');

// Middleware para verificar JWT en rutas protegidas
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(403).json({ success: false, message: 'Se requiere token de autenticación' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, message: 'Token inválido' });
    req.admin = decoded;
    next();
  });
};

// Rutas públicas
router.post('/', turnoController.crearTurno);
router.get('/disponibilidad', turnoController.getTurnosPorFecha);

// Rutas protegidas (Admin)
router.get('/', verificarToken, turnoController.getTurnos);
router.delete('/:id', verificarToken, turnoController.eliminarTurno);
router.put('/:id', verificarToken, turnoController.editarTurno);

module.exports = router;
