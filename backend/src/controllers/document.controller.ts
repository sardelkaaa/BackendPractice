import { Response, NextFunction } from 'express';
import { documentService } from '../services/document.service.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

interface MulterRequest extends AuthRequest {
  file?: any;
}

export const documentController = {
  async getOrCreate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { applicationId } = req.query;
      const cohortId = Array.isArray(req.query.cohortId) ? req.query.cohortId[0] : req.query.cohortId;

      if (!applicationId || !cohortId) {
        res.status(400).json({ error: { message: 'applicationId and cohortId are required', code: 'VALIDATION_ERROR' } });
        return;
      }

      const doc = await documentService.getOrCreate(userId, cohortId as string, applicationId as string);
      res.json(doc);
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cohortId = Array.isArray(req.query.cohortId) ? req.query.cohortId[0] : req.query.cohortId;

      if (!cohortId) {
        res.status(400).json({ error: { message: 'cohortId is required', code: 'VALIDATION_ERROR' } });
        return;
      }

      const doc = await documentService.update(userId, cohortId as string, req.body);
      res.json(doc);
    } catch (error) {
      next(error);
    }
  },

  async uploadReport(req: MulterRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cohortId = Array.isArray(req.query.cohortId) ? req.query.cohortId[0] : req.query.cohortId;

      if (!cohortId) {
        res.status(400).json({ error: { message: 'cohortId is required', code: 'VALIDATION_ERROR' } });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({ error: { message: 'File is required', code: 'VALIDATION_ERROR' } });
        return;
      }

      const fileUrl = `/uploads/${file.filename}`;
      const doc = await documentService.uploadReport(userId, cohortId as string, fileUrl);
      res.json(doc);
    } catch (error) {
      next(error);
    }
  },

  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const cohortId = Array.isArray(req.query.cohortId) ? req.query.cohortId[0] : req.query.cohortId;
      const type = Array.isArray(req.params.type) ? req.params.type[0] : req.params.type;

      if (!cohortId) {
        res.status(400).json({ error: { message: 'cohortId is required', code: 'VALIDATION_ERROR' } });
        return;
      }

      const buffer = await documentService.generate(userId, cohortId as string, type);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${type}.docx"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  },

  async setReview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const cohortId = Array.isArray(req.params.cohortId) ? req.params.cohortId[0] : req.params.cohortId;
      const doc = await documentService.setReview(userId, cohortId, req.body);
      res.json(doc);
    } catch (error) {
      next(error);
    }
  },

  async approveReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
      const cohortId = Array.isArray(req.params.cohortId) ? req.params.cohortId[0] : req.params.cohortId;
      const { approved } = req.body;
      const doc = await documentService.approveReport(userId, cohortId, approved);
      res.json(doc);
    } catch (error) {
      next(error);
    }
  },
};