import bcrypt from 'bcryptjs';
import { DataTypes } from 'sequelize';
import { STAFF_ROLES, USER_ROLES } from '../config/permissions.js';
import { sequelize } from '../config/database.js';

export const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    identifier: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.VIRTUAL,
      set(value) {
        this.setDataValue('password', value);
        if (value) {
          this.setDataValue('passwordHash', value);
        }
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'password_hash',
    },
    role: {
      type: DataTypes.ENUM(...Object.values(USER_ROLES)),
      allowNull: false,
      defaultValue: USER_ROLES.STUDENT,
    },
    staffRole: {
      type: DataTypes.ENUM(...Object.values(STAFF_ROLES)),
      allowNull: true,
      field: 'staff_role',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active',
    },
    refreshTokenVersion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'refresh_token_version',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    hooks: {
      beforeSave: async (user) => {
        if (!user.changed('passwordHash') || !user.passwordHash) {
          return;
        }

        if (
          user.passwordHash.startsWith('$2a$') ||
          user.passwordHash.startsWith('$2b$')
        ) {
          return;
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      },
    },
  },
);

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

User.prototype.toSafeJSON = function () {
  const { password, passwordHash, ...safeUser } = this.get({ plain: true });
  return safeUser;
};
