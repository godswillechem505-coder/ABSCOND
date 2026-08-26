import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const DownloadDocument = sequelize.define('DownloadDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
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
    type: DataTypes.ENUM('academic', 'finance', 'personal', 'handbook', 'general'),
    allowNull: false,
    defaultValue: 'general',
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 102400,
  },
  academicSessionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('published', 'draft'),
    allowNull: false,
    defaultValue: 'published',
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});
