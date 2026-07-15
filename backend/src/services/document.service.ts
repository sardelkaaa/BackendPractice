import { studentDocumentDataRepository } from '../repositories/studentDocumentData.repository.js';
import { applicationRepository } from '../repositories/application.repository.js';
import { cohortRepository } from '../repositories/cohort.repository.js';
import { docxService } from './docx.service.js';
import { mailService } from '../lib/mail.service.js';
import { NotFoundError, ValidationError } from '../errors/index.js';
import { StudentDocumentData } from '../generated/prisma/client.js';

const REQUIRED_FIELDS: Record<'individual' | 'review' | 'title', string[]> = {
  individual: ['studentFio', 'group', 'directionCode', 'directionName', 'programName', 'practiceTopic', 'mainStageTasks'],
  review: ['studentFio', 'group', 'reviewActivities', 'reviewCharacteristic', 'reviewEmployed', 'reviewNextPractice', 'reviewEmploymentOffer', 'reviewSuggestions', 'reviewGrade'],
  title: ['studentFio', 'group', 'specialty', 'practiceTopic'],
};

const TEMPLATE_MAP: Record<string, string> = {
  'individual-task': 'individual-task.docx',
  'title-page': 'title-page.docx',
  'review': 'review.docx',
};

function checkEligibility(doc: StudentDocumentData, type: 'individual' | 'review' | 'title', applicationStatus: string) {
  if (type === 'individual' && applicationStatus !== 'approved') {
    throw new ValidationError('Заявка ещё не одобрена');
  }
  if (type === 'title' && (!doc.reportFileUrl || !doc.reportAdminApproved)) {
    throw new ValidationError('Отчёт не загружен или не подтверждён администратором');
  }

  const missing = REQUIRED_FIELDS[type].filter((key) => !(doc as any)[key]);
  if (missing.length > 0) {
    throw new ValidationError(`Не заполнены поля: ${missing.join(', ')}`);
  }
}

export const documentService = {
  async getOrCreate(userId: string, cohortId: string, applicationId: string) {
    return studentDocumentDataRepository.findOrCreate(userId, cohortId, applicationId);
  },

  async update(userId: string, cohortId: string, data: Partial<StudentDocumentData>) {
    const doc = await studentDocumentDataRepository.findByUserAndCohort(userId, cohortId);
    if (!doc) throw new NotFoundError('Document data not found');

    return studentDocumentDataRepository.update(doc.id, data);
  },

  async uploadReport(userId: string, cohortId: string, fileUrl: string) {
    const doc = await studentDocumentDataRepository.findByUserAndCohort(userId, cohortId);
    if (!doc) throw new NotFoundError('Document data not found');

    return studentDocumentDataRepository.setReportFile(doc.id, fileUrl);
  },

  async generate(userId: string, cohortId: string, type: string) {
    const doc = await studentDocumentDataRepository.findByUserAndCohort(userId, cohortId);
    if (!doc) throw new NotFoundError('Document data not found');

    // Get application to check status
    const application = await applicationRepository.findById(doc.applicationId);
    if (!application) throw new NotFoundError('Application not found');

    // Get cohort for dates
    const cohort = await cohortRepository.findById(cohortId);
    if (!cohort) throw new NotFoundError('Cohort not found');

    const templateName = TEMPLATE_MAP[type];
    if (!templateName) throw new ValidationError(`Unknown document type: ${type}`);

    // Map URL type keys to required-fields keys
    const requiredKey = type === 'individual-task' ? 'individual' : type === 'title-page' ? 'title' : type;
    checkEligibility(doc, requiredKey as 'individual' | 'review' | 'title', application.status);

    // Build data for template
    const templateData: Record<string, unknown> = {
      studentFio: doc.studentFio,
      group: doc.group,
      directionCode: doc.directionCode,
      directionName: doc.directionName,
      programName: doc.programName,
      specialty: doc.specialty,
      practiceTopic: doc.practiceTopic,
      mainStageTasks: doc.mainStageTasks,
      reviewActivities: doc.reviewActivities,
      reviewCharacteristic: doc.reviewCharacteristic,
      reviewEmployed: doc.reviewEmployed,
      reviewNextPractice: doc.reviewNextPractice,
      reviewEmploymentOffer: doc.reviewEmploymentOffer,
      reviewSuggestions: doc.reviewSuggestions,
      reviewGrade: doc.reviewGrade,
      practiceStart: cohort.practiceStart.toISOString().split('T')[0],
      practiceEnd: cohort.practiceEnd.toISOString().split('T')[0],
      // Вычисляемые даты для шаблона
      practiceStartPlus7: new Date(cohort.practiceStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      practiceStartPlus23: new Date(cohort.practiceStart.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      practiceEndMinus3: new Date(cohort.practiceEnd.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    return docxService.generate(templateName, templateData);
  },

  async setReview(userId: string, cohortId: string, data: {
    reviewActivities?: string;
    reviewCharacteristic?: string;
    reviewEmployed?: string;
    reviewNextPractice?: string;
    reviewEmploymentOffer?: string;
    reviewSuggestions?: string;
    reviewGrade?: string;
  }) {
    const doc = await studentDocumentDataRepository.findByUserAndCohort(userId, cohortId);
    if (!doc) throw new NotFoundError('Document data not found');

    const updated = await studentDocumentDataRepository.setReviewFields(doc.id, data);

    // Check if all review fields are filled -> send notification
    const allReviewFields = REQUIRED_FIELDS.review;
    const updatedDoc = await studentDocumentDataRepository.findByUserAndCohort(userId, cohortId);
    const allFilled = allReviewFields.every((key) => (updatedDoc as any)[key]);

    if (allFilled) {
      try {
        const application = await applicationRepository.findById(doc.applicationId);
        if (application) {
          await mailService.sendEmail(mailService.createDocumentReadyEmail(application.user, 'review'));
        }
      } catch (error) {
        console.error('Не удалось отправить уведомление о готовности отзыва:', error);
      }
    }

    return updated;
  },

  async approveReport(userId: string, cohortId: string, approved: boolean) {
    const doc = await studentDocumentDataRepository.findByUserAndCohort(userId, cohortId);
    if (!doc) throw new NotFoundError('Document data not found');

    const updated = await studentDocumentDataRepository.setReportApproved(doc.id, approved);

    if (approved) {
      try {
        const application = await applicationRepository.findById(doc.applicationId);
        if (application) {
          await mailService.sendEmail(mailService.createDocumentReadyEmail(application.user, 'title-page'));
        }
      } catch (error) {
        console.error('Не удалось отправить уведомление о готовности титульного листа:', error);
      }
    }

    return updated;
  },
};