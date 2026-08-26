import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  feeStructureId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  academicSessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  semester: {
    type: DataTypes.ENUM('first', 'second', 'all'),
    allowNull: false,
    defaultValue: 'first',
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NGN',
  },
  paymentMethod: {
    type: DataTypes.ENUM(
      'bank_transfer',
      'pos',
      'cash',
      'card',
      'bank_draft',
      'online',
    ),
    allowNull: false,
    defaultValue: 'bank_transfer',
  },
  reference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  receiptNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    allowNull: false,
    defaultValue: 'verified',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  recordedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});
