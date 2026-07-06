// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { RegisterRequest, LoginRequest, AuthResponse, UserProfile } from '../types/index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { AuthenticationError } from '../errors/index.js';

export const authController = {
  async register(
    req: Request<{}, {}, RegisterRequest>,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;
      const result = await authService.register(email, password);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(
    req: Request<{}, {}, LoginRequest>,
    res: Response<AuthResponse>,
    next: NextFunction
  ) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(
    req: AuthRequest,
    res: Response<UserProfile>,
    next: NextFunction
  ) {
    try {
        if (!req.user) {
            throw new AuthenticationError('User not authorized');
        }

        const user = await authService.getUserProfile(req.user?.id);

        res.json(user);
    } catch (error) {
        next(error);
    }
  },
};