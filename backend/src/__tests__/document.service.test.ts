import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../db/prisma.js';
import { documentService } from '../services/document.service.js';

const mockDoc: any = {
  id: 'doc-1',
  userId: 'user-1',
  cohortId: 'cohort-1',
  applicationId: 'app-1',
  studentFio: 'Иван Иванов',
  group: 'ПИ-301',
  directionCode: '09.03.04',
  directionName: 'Программная инженерия',
  programName: 'Разработка ПО',
  specialty: 'Программист',
  practiceTopic: 'Разработка веб-приложения',
  mainStageTasks: '1. Анализ\n2. Проектирование\n3. Разработка',
  reviewActivities: null,
  reviewCharacteristic: null,
  reviewEmployed: null,
  reviewNextPractice: null,
  reviewEmploymentOffer: null,
  reviewSuggestions: null,
  reviewGrade: null,
  reportFileUrl: null,
  reportAdminApproved: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockApplication: any = {
  id: 'app-1',
  userId: 'user-1',
  cohortId: 'cohort-1',
  status: 'approved',
  user: { id: 'user-1', email: 'test@example.com' },
};

const mockCohort: any = {
  id: 'cohort-1',
  name: '2026',
  practiceStart: new Date('2026-06-01'),
  practiceEnd: new Date('2026-08-31'),
};

describe('DocumentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrCreate', () => {
    it('should return existing document data', async () => {
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce(mockDoc);
      const result = await documentService.getOrCreate('user-1', 'cohort-1', 'app-1');
      expect(result.id).toBe('doc-1');
    });

    it('should create new document data if not exists', async () => {
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce(null);
      vi.mocked(prisma.studentDocumentData.create).mockResolvedValueOnce(mockDoc);
      const result = await documentService.getOrCreate('user-1', 'cohort-1', 'app-1');
      expect(result.id).toBe('doc-1');
    });
  });

  describe('update', () => {
    it('should update document data', async () => {
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce(mockDoc);
      vi.mocked(prisma.studentDocumentData.update).mockResolvedValueOnce({
        ...mockDoc,
        studentFio: 'Петр Петров',
      });

      const result = await documentService.update('user-1', 'cohort-1', { studentFio: 'Петр Петров' });
      expect(result.studentFio).toBe('Петр Петров');
    });

    it('should throw NotFoundError if document not found', async () => {
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce(null);
      await expect(documentService.update('user-1', 'cohort-1', { studentFio: 'Test' }))
        .rejects.toThrow('Document data not found');
    });
  });

  describe('uploadReport', () => {
    it('should upload report file', async () => {
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce(mockDoc);
      vi.mocked(prisma.studentDocumentData.update).mockResolvedValueOnce({
        ...mockDoc,
        reportFileUrl: '/uploads/report.pdf',
      });

      const result = await documentService.uploadReport('user-1', 'cohort-1', '/uploads/report.pdf');
      expect(result.reportFileUrl).toBe('/uploads/report.pdf');
    });

    it('should throw NotFoundError if document not found', async () => {
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce(null);
      await expect(documentService.uploadReport('user-1', 'cohort-1', '/uploads/test.pdf'))
        .rejects.toThrow('Document data not found');
    });
  });

  describe('setReview', () => {
    it('should set review fields', async () => {
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce(mockDoc);
      vi.mocked(prisma.studentDocumentData.update).mockResolvedValueOnce({
        ...mockDoc,
        reviewGrade: '5',
        reviewActivities: 'Отлично',
      });
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce({
        ...mockDoc,
        reviewGrade: '5',
        reviewActivities: 'Отлично',
        reviewCharacteristic: 'Хорошо',
        reviewEmployed: 'Да',
        reviewNextPractice: 'Нет',
        reviewEmploymentOffer: 'Да',
        reviewSuggestions: 'Нет',
      });

      const result = await documentService.setReview('user-1', 'cohort-1', {
        reviewGrade: '5',
        reviewActivities: 'Отлично',
      });
      expect(result.reviewGrade).toBe('5');
    });
  });

  describe('approveReport', () => {
    it('should approve report', async () => {
      vi.mocked(prisma.studentDocumentData.findFirst).mockResolvedValueOnce(mockDoc);
      vi.mocked(prisma.studentDocumentData.update).mockResolvedValueOnce({
        ...mockDoc,
        reportAdminApproved: true,
      });
    })
  })
})
