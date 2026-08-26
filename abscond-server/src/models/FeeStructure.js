import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const FeeStructure = sequelize.define('FeeStructure', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academicSessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  programmeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '100',
  },
  semester: {
    type: DataTypes.ENUM('first', 'second', 'all'),
    allowNull: false,
    defaultValue: 'all',
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NGN',
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});
