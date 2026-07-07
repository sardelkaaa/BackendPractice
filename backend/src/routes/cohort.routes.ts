import { Router } from 'express';
import { cohortController } from '../controllers/cohort.controller.js';
import { cohortRoleController } from '../controllers/cohortRole.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/requireRole.js';
import { cohortContextMiddleware } from '../middleware/cohortContext.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(requireRole(['ADMIN']));

/**
 * @swagger
 * /admin/cohorts:
 *   post:
 *     summary: Создать новую когорту
 *     description: Только для админа. Задаёт сроки приёма заявок и сроки прохождения практики.
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - applicationStart
 *               - applicationEnd
 *               - practiceStart
 *               - practiceEnd
 *             properties:
 *               name:
 *                 type: string
 *                 example: "2026"
 *               applicationStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-01-01T00:00:00.000Z"
 *               applicationEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-03-01T00:00:00.000Z"
 *               practiceStart:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-06-01T00:00:00.000Z"
 *               practiceEnd:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-08-31T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Когорта создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       400:
 *         description: Ошибка валидации (например, даты заданы некорректно)
 *       409:
 *         description: Когорта с таким названием уже существует
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Требуется роль администратора
 */
router.post('/', cohortController.create);

/**
 * @swagger
 * /admin/cohorts:
 *   get:
 *     summary: Получить список всех когорт
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список когорт
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cohort'
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Требуется роль администратора
 */
router.get('/', cohortController.findAll);

/**
 * @swagger
 * /admin/cohorts/{id}:
 *   get:
 *     summary: Получить когорту по ID
 *     tags: [Cohorts]
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
 *         description: Когорта найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       404:
 *         description: Когорта не найдена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Требуется роль администратора
 */
router.get('/:id', cohortController.findById);

/**
 * @swagger
 * /admin/cohorts/{id}:
 *   put:
 *     summary: Обновить когорту
 *     description: Позволяет изменить название и/или сроки. Все поля необязательны — обновляются только переданные.
 *     tags: [Cohorts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               applicationStart:
 *                 type: string
 *                 format: date-time
 *               applicationEnd:
 *                 type: string
 *                 format: date-time
 *               practiceStart:
 *                 type: string
 *                 format: date-time
 *               practiceEnd:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Когорта обновлена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cohort'
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Когорта не найдена
 *       409:
 *         description: Когорта с таким названием уже существует
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Требуется роль администратора
 */
router.put('/:id', cohortController.update);

/**
 * @swagger
 * /admin/cohorts/{id}:
 *   delete:
 *     summary: Удалить когорту
 *     description: |
 *       Осторожно: если у когорты уже есть заявки, документы или задачи практикантов,
 *       убедитесь, что на уровне сервиса это обрабатывается безопасно
 *       (запрет удаления при наличии связанных данных либо архивирование вместо
 *       физического удаления).
 *     tags: [Cohorts]
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
 *         description: Когорта удалена
 *       404:
 *         description: Когорта не найдена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Требуется роль администратора
 */
router.delete('/:id', cohortController.delete);

/**
 * @swagger
 * /admin/cohorts/{cohortId}/roles:
 *   post:
 *     summary: Добавить роль/трек в когорту
 *     description: Например, "Frontend", "Backend", "Аналитик" — произвольный текст, задаётся заново под каждую когорту.
 *     tags: [Cohort Roles]
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Frontend"
 *     responses:
 *       201:
 *         description: Роль создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CohortRole'
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Когорта не найдена
 *       409:
 *         description: Такая роль уже есть в этой когорте
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Требуется роль администратора
 */
router.post('/:cohortId/roles', cohortContextMiddleware, cohortRoleController.create);

/**
 * @swagger
 * /admin/cohorts/{cohortId}/roles:
 *   get:
 *     summary: Получить список ролей когорты
 *     tags: [Cohort Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Список ролей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CohortRole'
 *       404:
 *         description: Когорта не найдена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Требуется роль администратора
 */
router.get('/:cohortId/roles', cohortContextMiddleware, cohortRoleController.findByCohort);

/**
 * @swagger
 * /admin/cohorts/roles/{id}:
 *   delete:
 *     summary: Удалить роль
 *     description: |
 *       Если роль уже назначена практикантам (Application.roleId), проверьте
 *       на уровне сервиса, что удаление не оставляет заявки со ссылкой
 *       на несуществующую роль.
 *     tags: [Cohort Roles]
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
 *         description: Роль удалена
 *       404:
 *         description: Роль не найдена
 *       401:
 *         description: Не авторизован
 *       403:
 *         description: Требуется роль администратора
 */
router.delete('/roles/:id', cohortContextMiddleware, cohortRoleController.delete);

export default router;