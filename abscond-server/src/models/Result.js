import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Result = sequelize.define(
  'Result',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: false },
    academicSessionId: { type: DataTypes.INTEGER, allowNull: false },
    semester: { type: DataTypes.ENUM('first', 'second'), allowNull: false },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: { min: 0, max: 100 },
    },
    grade: { type: DataTypes.STRING(2), allowNull: false },
    gradePoint: { type: DataTypes.DECIMAL(3, 2), allowNull: false },
    units: { type: DataTypes.INTEGER, allowNull: false },
    status: {
      type: DataTypes.ENUM('draft', 'published'),
      allowNull: false,
      defaultValue: 'draft',
    },
    enteredBy: { type: DataTypes.INTEGER, allowNull: false },
    publishedAt: { type: DataTypes.DATE, allowNull: true },
    publishedBy: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'course_id', 'academic_session_id', 'semester'],
      },
    ],
  },
);

