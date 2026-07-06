import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../errors/index.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // TODO: Реализовать а аутентификации
  next();
};