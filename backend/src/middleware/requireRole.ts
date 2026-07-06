import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../errors/index.js';
import { AuthRequest } from './auth.middleware.js';

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // TODO: Реализовать а аутентификации
    next();
  };
};