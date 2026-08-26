import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ClinicalPosting = sequelize.define('ClinicalPosting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  hospitalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  wardUnit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  supervisorName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  supervisorContact: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('assigned', 'active', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'assigned',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});
