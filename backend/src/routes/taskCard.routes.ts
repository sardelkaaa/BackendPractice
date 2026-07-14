import { Router } from 'express';
import { taskCardController } from '../controllers/taskCard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Получить сетку задач на неделю
 *     description: |
 *       Возвращает рабочие дни недели (пн–пт) в пределах практики когорты
 *       с привязанными к ним задачами.
 *       Если `all=true` и роль ADMIN — возвращает задачи всех практикантов.
 *       Иначе — только задачи текущего пользователя.
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: weekStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         example: "2026-06-01"
 *       - in: query
 *         name: all
 *         required: false
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Сетка недели
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 weekStart:
 *                   type: string
 *                 cohortName:
 *                   type: string
 *                 workdays:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       tasks:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/TaskCard'
 *       404:
 *         description: Когорта не найдена
 */
router.get('/', taskCardController.getWeekGrid);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Создать задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cohortId, date, title]
 *             properties:
 *               cohortId:
 *                 type: string
 *                 description: ID когорты
 *                 example: "clxxyz123"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Дата задачи (должна быть в пределах периода практики и рабочим днём пн–пт)
 *                 example: "2026-09-15"
 *               title:
 *                 type: string
 *                 description: Название задачи
 *                 example: "Настройка CI/CD"
 *               description:
 *                 type: string
 *                 description: Описание задачи (опционально)
 *                 example: "Настроить GitHub Actions для автоматического деплоя"
 *               artifactLink:
 *                 type: string
 *                 description: Ссылка на результат/артефакт (опционально)
 *                 example: "https://github.com/user/repo/pull/42"
 *     responses:
 *       201:
 *         description: Задача создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 cohortId:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 artifactLink:
 *                   type: string
 *       400:
 *         description: |
 *           Ошибка валидации:
 *           - date вне периода практики
 *           - date — выходной (сб/вс)
 *           - не указаны cohortId/date/title
 *       404:
 *         description: Когорта не найдена
 *       409:
 *         description: "Задача на этот день уже существует. Уникальность: связка userId, cohortId, date."
 */
router.post('/', taskCardController.create);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Обновить задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               artifactLink:
 *                 type: string
 *     responses:
 *       200:
 *         description: Задача обновлена
 *       403:
 *         description: Нет прав (не админ и не владелец)
 *       404:
 *         description: Задача не найдена
 */
router.patch('/:id', taskCardController.update);

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Удалить задачу
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Задача удалена
 *       403:
 *         description: Нет прав
 *       404:
 *         description: Задача не найдена
 */
router.delete('/:id', taskCardController.delete);

export default router;