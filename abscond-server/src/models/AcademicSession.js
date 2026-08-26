import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const AcademicSession = sequelize.define('AcademicSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  startsOn: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  endsOn: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});
