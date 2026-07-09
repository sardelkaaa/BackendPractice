import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { taskCardService } from '../services/taskCard.service.js';

export const taskCardController = {
  async getWeekGrid(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cohortId, weekStart, all } = req.query;
      const cohortIdStr = Array.isArray(cohortId) ? cohortId[0] : cohortId;
      const weekStartStr = Array.isArray(weekStart) ? weekStart[0] : weekStart;
      const allFlag = all === 'true';

      const result = await taskCardService.getWeekGrid(
        cohortIdStr as string,
        weekStartStr as string,
        req.user!.id,
        req.user!.role,
        allFlag,
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { cohortId, date, title, description, artifactLink } = req.body;
      const task = await taskCardService.create({
        userId: req.user!.id,
        cohortId,
        date,
        title,
        description,
        artifactLink,
      });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const taskId = Array.isArray(id) ? id[0] : id;
      const { title, description, artifactLink } = req.body;
      const task = await taskCardService.update(
        taskId,
        req.user!.id,
        req.user!.role,
        { title, description, artifactLink },
      );
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const taskId = Array.isArray(id) ? id[0] : id;
      await taskCardService.delete(taskId, req.user!.id, req.user!.role);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};