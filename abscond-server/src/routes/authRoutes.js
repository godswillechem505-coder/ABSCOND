import { Router } from 'express';
import {
  authBootstrap,
  forgotPassword,
  login,
  logout,
  me,
  refresh,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

export const authRoutes = Router();

authRoutes.get('/bootstrap', authBootstrap);
authRoutes.post('/login', loginRateLimiter(), login());
authRoutes.post('/refresh', refresh);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/logout', authenticate, logout);
authRoutes.get('/me', authenticate, me);
