import dotenv from 'dotenv';
import { app } from './app.js';
import { connectDB, sequelize, syncDatabase } from './config/database.js';

dotenv.config();

const port = Number(process.env.PORT || 4000);

const startServer = async () => {
  await connectDB();
  await syncDatabase();

  const server = app.listen(port, () => {
    console.log(`ABSCONS One API listening on port ${port}.`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await sequelize.close();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
