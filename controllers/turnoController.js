const { Op } = require('sequelize');
const Turno = require('../models/Turno');

// Obtener todos los turnos (para dashboard admin)
exports.getTurnos = async (req, res) => {
  try {
    const turnos = await Turno.findAll({
      order: [['fecha', 'DESC'], ['hora', 'ASC']]
    });
    res.json({ success: true, data: turnos });
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los turnos' });
  }
};

// Consultar turnos de un día específico (para disponibilidad cliente)
exports.getTurnosPorFecha = async (req, res) => {
  try {
    const { fecha, barbero } = req.query;
    
    if (!fecha || !barbero) {
      return res.status(400).json({ success: false, message: 'Fecha y barbero son requeridos' });
    }

    const turnos = await Turno.findAll({
      where: {
        fecha,
        barbero
      },
      attributes: ['hora', 'duracionMinutos']
    });

    res.json({ success: true, data: turnos });
  } catch (error) {
    console.error('Error al obtener turnos por fecha:', error);
    res.status(500).json({ success: false, message: 'Error al consultar disponibilidad' });
  }
};

// Crear un nuevo turno
exports.crearTurno = async (req, res) => {
  try {
    const { nombre, apellido, telefono, servicio, fecha, hora, barbero, pago, duracionMinutos } = req.body;
    
    // Validar superposición (simplificado)
    const existente = await Turno.findOne({
      where: {
        fecha,
        hora,
        barbero
      }
    });

    if (existente) {
      return res.status(400).json({ success: false, message: 'El horario ya está ocupado' });
    }

    const cliente = `${nombre} ${apellido}`;

    const nuevoTurno = await Turno.create({
      cliente,
      telefono,
      servicio,
      fecha,
      hora,
      barbero,
      pago,
      duracionMinutos: parseInt(duracionMinutos) || 0
    });

    res.json({ success: true, message: 'Turno creado con éxito', data: nuevoTurno });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ success: false, message: 'Error al guardar el turno' });
  }
};

// Eliminar un turno (admin)
exports.eliminarTurno = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await Turno.destroy({ where: { id } });
    
    if (eliminado) {
      res.json({ success: true, message: 'Turno eliminado correctamente' });
    } else {
      res.status(404).json({ success: false, message: 'Turno no encontrado' });
    }
  } catch (error) {
    console.error('Error al eliminar turno:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el turno' });
  }
};

// Editar un turno (admin)
exports.editarTurno = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await Turno.update(req.body, {
            where: { id }
        });
        if (updated) {
            const updatedTurno = await Turno.findByPk(id);
            return res.json({ success: true, message: 'Turno actualizado correctamente', data: updatedTurno });
        }
        throw new Error('Turno no encontrado');
    } catch (error) {
        console.error('Error al actualizar turno:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
};
