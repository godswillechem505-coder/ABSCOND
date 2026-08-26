import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Semester = sequelize.define(
  'Semester',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    academicSessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.ENUM('first', 'second'),
      allowNull: false,
    },
    startsOn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endsOn: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    registrationOpensAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    registrationClosesAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // Virtual: computed from registration window dates
    isRegistrationOpen: {
      type: DataTypes.VIRTUAL,
      get() {
        const now = new Date();
        const opens = this.getDataValue('registrationOpensAt');
        const closes = this.getDataValue('registrationClosesAt');
        if (!opens || !closes) return false;
        return now >= new Date(opens) && now <= new Date(closes);
      },
    },
  },
  {
    tableName: 'semesters',
    timestamps: true,
  },
);

