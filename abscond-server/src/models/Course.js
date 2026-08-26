import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  programmeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  prerequisiteCourseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  semester: {
    type: DataTypes.ENUM('first', 'second'),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('core', 'elective'),
    allowNull: false,
    defaultValue: 'core',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});
