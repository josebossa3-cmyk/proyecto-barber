const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  clave: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'administradores',
  timestamps: false,
});

module.exports = Admin;
