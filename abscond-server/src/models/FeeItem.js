import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const FeeItem = sequelize.define('FeeItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  feeStructureId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM(
      'tuition',
      'clinical',
      'laboratory',
      'library',
      'ict',
      'welfare',
      'examination',
      'other',
    ),
    allowNull: false,
    defaultValue: 'tuition',
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0.0,
  },
  isCompulsory: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});
