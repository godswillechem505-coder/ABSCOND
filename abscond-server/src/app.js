import cors from 'cors';
import express from 'express';
import './models/index.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { docRoutes } from './routes/docRoutes.js';
import { referenceRoutes } from './routes/referenceRoutes.js';
import { studentRoutes } from './routes/studentRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

import { UPLOADS_DIR } from './middleware/upload.js';

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  }),
);
app.use('/uploads', express.static(UPLOADS_DIR));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ABSCONS One API',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/docs', docRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/students', studentRoutes);

app.use(notFound);
app.use(errorHandler);
