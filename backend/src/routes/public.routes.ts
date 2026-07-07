import { Router } from 'express';
import { cohortController } from '../controllers/cohort.controller.js';

const router = Router();

/**
 * @swagger
 * /public/cohorts/active:
 *   get:
 *     summary: Получить активную когорту
 *     description: |
 *       Возвращает когорту, для которой сейчас идёт приём заявок
 *       (текущая дата попадает в диапазон applicationStart–applicationEnd).
 *       Эндпоинт публичный — авторизация не требуется, используется для
 *       отображения анкеты неавторизованному кандидату.
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Активная когорта найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       404:
 *         description: Сейчас нет когорты с открытым приёмом заявок
 */
router.get('/cohorts/active', cohortController.findActive);

export default router;