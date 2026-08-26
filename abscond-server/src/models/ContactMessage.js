import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ContactMessage = sequelize.define('ContactMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Admissions',
  },
  status: {
    type: DataTypes.ENUM('new', 'in_progress', 'resolved'),
    allowNull: false,
    defaultValue: 'new',
  },
  assignedTo: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  replyText: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  repliedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  repliedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});
