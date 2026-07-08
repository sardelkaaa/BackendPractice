import { Router } from 'express';
import { surveyController } from '../controllers/survey.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/requireRole.js';
import { cohortContextMiddleware } from '../middleware/cohortContext.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['ADMIN']));

/**
 * @swagger
 * /admin/cohorts/{cohortId}/survey-fields:
 *   post:
 *     summary: Создать новое поле анкеты для когорты
 *     tags: [Admin / Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, type, order]
 *             properties:
 *               label:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, select]
 *               options:
 *                 type: string
 *               order:
 *                 type: integer
 *               isRequired:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Поле создано
 */
router.post('/cohorts/:cohortId/survey-fields', cohortContextMiddleware, surveyController.create);

/**
 * @swagger
 * /admin/cohorts/{cohortId}/survey-fields/{id}:
 *   patch:
 *     summary: Обновить поле анкеты
 *     tags: [Admin / Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [text, select]
 *               options:
 *                 type: string
 *               order:
 *                 type: integer
 *               isRequired:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Поле обновлено
 */
router.patch('/cohorts/:cohortId/survey-fields/:id', cohortContextMiddleware, surveyController.update);

/**
 * @swagger
 * /admin/cohorts/{cohortId}/survey-fields/{id}:
 *   delete:
 *     summary: Удалить поле анкеты
 *     tags: [Admin / Survey]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Поле удалено
 */
router.delete('/cohorts/:cohortId/survey-fields/:id', cohortContextMiddleware, surveyController.delete);

export default router;