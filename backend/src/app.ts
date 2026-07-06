import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware.js';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes)

app.use(errorHandler);