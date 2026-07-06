import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { ConflictError, ValidationError, AuthenticationError } from '../errors/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

export const authService = {
    async register(email: string, password: string) {
        const normEmail = email.toLowerCase().trim();

        if (!normEmail) {
            throw new ValidationError('Email is required');
        }

        if (!password || password.length < 8) {
            throw new ValidationError('Minimum password length is 8');
        }

        const existingUser = await userRepository.findByEmail(normEmail);
        if (existingUser) {
            throw new ConflictError('User already exists');
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await userRepository.create(email, passwordHash);
        const token = this.generateToken(user.id, user.email);

        return {
            id: user.id,
            email: user.email,
            token,
        };
    },

    async login(email: string, password: string) {
        const normEmail = email.toLowerCase().trim();

        if (!normEmail || !password) {
            throw new ValidationError('Email and password is required');
        }

        const user = await userRepository.findByEmail(normEmail);
        if (!user) {
            throw new AuthenticationError('User not found');
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            throw new AuthenticationError('Incorrect password');
        }

        const token = this.generateToken(user.id, user.email);

        return {
            id: user.id,
            email: user.email,
            token,
        };
    },

    generateToken(userId: string, email: string): string {
        const payload = { id: userId, email };
        const options: jwt.SignOptions = {
        expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
        };
        return jwt.sign(payload, JWT_SECRET, options);
    },
    
    verifyToken(token: string): { id: string; email: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      return decoded;
    } catch (error) {
      throw new AuthenticationError('Недействительный или истекший токен');
    }
  },

  async getUserProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('Пользователь не найден');
    }

    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
};