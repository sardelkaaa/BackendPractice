import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware.js';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import { setupSwagger } from './utils/swagger.js';
import authRoutes from './routes/auth.routes.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use('/health', healthRoutes)
app.use('/auth', authRoutes);

app.use(errorHandler);