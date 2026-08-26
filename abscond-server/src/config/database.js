import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dialect = process.env.DB_DIALECT || 'sqlite';
const logging = process.env.DB_LOGGING === 'true' ? console.log : false;
const storagePath = process.env.DB_STORAGE
  ? path.resolve(process.cwd(), process.env.DB_STORAGE)
  : path.join(__dirname, '../../abscons.sqlite');

const baseOptions = {
  dialect,
  logging,
  retry: {
    match: [/SQLITE_BUSY/],
    max: 5,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
};

export const sequelize =
  dialect === 'sqlite'
    ? new Sequelize({
        ...baseOptions,
        storage: storagePath,
        pool: {
          max: 1,
          min: 0,
          idle: 10000,
        },
      })
    : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
        ...baseOptions,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
      });

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected successfully using ${dialect}.`);
  } catch (error) {
    console.error('Unable to connect to database:', error);
    throw error;
  }
};

export const syncDatabase = async () => {
  if (process.env.DB_SYNC === 'false') {
    return;
  }

  await sequelize.sync({
    alter: process.env.DB_SYNC_ALTER === 'true',
  });
};
