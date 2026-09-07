import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CalendarEntry = sequelize.define('CalendarEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  academicSessionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  semesterId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM(
      'registration',
      'lectures',
      'assessment',
      'clinical',
      'revision',
      'examination',
      'break',
      'holiday',
      'matriculation',
      'convocation',
      'general'
    ),
    allowNull: false,
    defaultValue: 'general',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  startTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  endTime: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'All Campuses',
  },
  targetLevel: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'all',
  },
  isHoliday: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'published',
  },
});
