const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Turno = sequelize.define('Turno', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cliente: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
  },
  servicio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  barbero: {
    type: DataTypes.STRING,
  },
  pago: {
    type: DataTypes.STRING,
  },
  duracionMinutos: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'turnos',
  timestamps: true,
  createdAt: 'creado',
  updatedAt: false,
});

module.exports = Turno;
