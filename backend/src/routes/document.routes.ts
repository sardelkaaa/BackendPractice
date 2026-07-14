import { Router } from 'express';
import multer from 'multer';
import { documentController } from '../controllers/document.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /documents/my:
 *   get:
 *     summary: Получить или создать документы для заявки
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные документов
 */
router.get('/my', documentController.getOrCreate);

/**
 * @swagger
 * /documents/my:
 *   patch:
 *     summary: Обновить поля документов
 *     description: |
 *       Обновляет данные практиканта для генерации документов.
 *       cohortId передаётся в query-параметре.
 *       Поля в body опциональны — обновляются только переданные.
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID когорты
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentFio:
 *                 type: string
 *                 description: ФИО студента
 *                 example: "Иванов Иван Иванович"
 *               group:
 *                 type: string
 *                 description: Номер группы
 *                 example: "ИВБО-01-21"
 *               directionCode:
 *                 type: string
 *                 description: Код направления подготовки
 *                 example: "09.03.04"
 *               directionName:
 *                 type: string
 *                 description: Название направления
 *                 example: "Программная инженерия"
 *               programName:
 *                 type: string
 *                 description: Название образовательной программы
 *                 example: "Разработка программного обеспечения"
 *               specialty:
 *                 type: string
 *                 description: Специальность/профиль
 *                 example: "Программист"
 *               practiceTopic:
 *                 type: string
 *                 description: Тема практики
 *                 example: "Веб-разработка на Node.js"
 *               mainStageTasks:
 *                 type: string
 *                 description: |
 *                   Основные этапы работы (заполняется после утверждения заявки).
 *                   Обязательно для генерации individual-task.
 *                 example: "1. Настройка окружения\n2. Разработка API\n3. Тестирование"
 *     responses:
 *       200:
 *         description: Данные обновлены
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
 *                 applicationId:
 *                   type: string
 *                 studentFio:
 *                   type: string
 *                 group:
 *                   type: string
 *                 directionCode:
 *                   type: string
 *                 directionName:
 *                   type: string
 *                 programName:
 *                   type: string
 *                 specialty:
 *                   type: string
 *                 practiceTopic:
 *                   type: string
 *                 mainStageTasks:
 *                   type: string
 *       400:
 *         description: cohortId обязателен
 *       404:
 *         description: Документ не найден
 */
router.patch('/my', documentController.update);

/**
 * @swagger
 * /documents/my/report:
 *   post:
 *     summary: Загрузить отчёт
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Отчёт загружен
 */
router.post('/my/report', upload.single('file'), documentController.uploadReport);

/**
 * @swagger
 * /documents/my/{type}/generate:
 *   get:
 *     summary: Сгенерировать документ
 *     description: |
 *       Генерирует .docx-файл на основе введённых данных практиканта.
 *
 *       **Типы документов:**
 *       - `individual-task` — индивидуальное задание на практику
 *       - `title-page` — титульный лист отчёта
 *       - `review` — отзыв руководителя практики
 *
 *       **Условия генерации:**
 *       - `individual-task`: заявка должна быть одобрена (`approved`), все поля студента должны быть заполнены.
 *       - `title-page`: отчёт должен быть загружен и подтверждён администратором.
 *       - `review`: все поля отзыва должны быть заполнены администратором.
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [individual-task, title-page, review]
 *         description: Тип документа для генерации
 *       - in: query
 *         name: cohortId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID когорты
 *     responses:
 *       200:
 *         description: |
 *           Сгенерированный .docx файл. Скачивается как attachment.
 *           Сохраните файл локально и откройте в Word или Google Docs.
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: |
 *           Ошибка валидации:
 *           - cohortId обязателен
 *           - неизвестный тип документа
 *           - не заполнены обязательные поля для данного типа
 *       404:
 *         description: Документ, заявка или когорта не найдены
 */
router.get('/my/:type/generate', documentController.generate);

export default router;