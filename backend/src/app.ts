import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware.js';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import { setupSwagger } from './utils/swagger.js';
import authRoutes from './routes/auth.routes.js';
import publicRoutes from './routes/public.routes.js';
import cohortRoutes from './routes/cohort.routes.js';
import surveyRoutes from './routes/survey.routes.js';
import applicationRoutes from './routes/application.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import documentRoutes from './routes/document.routes.js';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

setupSwagger(app);

app.use('/health', healthRoutes)
app.use('/auth', authRoutes);
app.use('/public', publicRoutes);
app.use('/admin/cohorts', cohortRoutes);
app.use('/admin', surveyRoutes);
app.use('/applications', applicationRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/documents', documentRoutes);

app.use(errorHandler);
