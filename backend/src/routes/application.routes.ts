import { Router } from 'express';
import { applicationController } from '../controllers/application.controller.js';
import { testTaskController } from '../controllers/testTask.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /applications:
 *   post:
 *     summary: Подать заявку на практику
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cohortId, answers]
 *             properties:
 *               cohortId:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fieldId:
 *                       type: string
 *                     value:
 *                       type: string
 *     responses:
 *       201:
 *         description: Заявка создана
 *       409:
 *         description: Заявка в эту когорту уже подана
 */
router.post('/', applicationController.submit);

/**
 * @swagger
 * /applications/my:
 *   get:
 *     summary: Получить свои заявки
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заявок текущего пользователя
 */
router.get('/my', applicationController.getMyApplications);

/**
 * @swagger
 * /applications/prefill:
 *   get:
 *     summary: Получить данные для предзаполнения из последней заявки
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Объект { label: value } из последней заявки
 */
router.get('/prefill', applicationController.getPrefill);

/**
 * @swagger
 * /applications/{id}/test-task:
 *   get:
 *     summary: Получить тестовое задание для заявки
 *     description: |
 *       Доступно только автору заявки. Возвращает содержимое тестового задания,
 *       если оно опубликовано. Если задание ещё не опубликовано — возвращает
 *       { published: false }.
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Результат
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     published:
 *                       type: boolean
 *                       example: true
 *                     content:
 *                       type: string
 *                 - type: object
 *                   properties:
 *                     published:
 *                       type: boolean
 *                       example: false
 *       403:
 *         description: Доступ запрещён
 *       404:
 *         description: Заявка не найдена
 */
router.get('/:id/test-task', testTaskController.getForApplication);

export default router;