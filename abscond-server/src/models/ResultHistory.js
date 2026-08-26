import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ResultHistory = sequelize.define('ResultHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  resultId: { type: DataTypes.INTEGER, allowNull: false },
  action: {
    type: DataTypes.ENUM('created', 'updated', 'published', 'unpublished'),
    allowNull: false,
  },
  previousValues: { type: DataTypes.JSON, allowNull: true },
  newValues: { type: DataTypes.JSON, allowNull: true },
  changedBy: { type: DataTypes.INTEGER, allowNull: false },
});
