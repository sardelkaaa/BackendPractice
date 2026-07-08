import prisma from '../db/prisma.js';
import { StudentDocumentData } from '../generated/prisma/client.js';

export const studentDocumentDataRepository = {
  async findOrCreate(userId: string, cohortId: string, applicationId: string): Promise<StudentDocumentData> {
    const existing = await prisma.studentDocumentData.findFirst({
      where: { userId, cohortId },
    });

    if (existing) return existing;

    return prisma.studentDocumentData.create({
      data: { userId, cohortId, applicationId },
    });
  },

  async findByUserAndCohort(userId: string, cohortId: string): Promise<StudentDocumentData | null> {
    return prisma.studentDocumentData.findFirst({
      where: { userId, cohortId },
    });
  },

  async update(id: string, data: Partial<StudentDocumentData>): Promise<StudentDocumentData> {
    return prisma.studentDocumentData.update({
      where: { id },
      data,
    });
  },

  async setReportFile(id: string, fileUrl: string): Promise<StudentDocumentData> {
    return prisma.studentDocumentData.update({
      where: { id },
      data: { reportFileUrl: fileUrl },
    });
  },

  async setReportApproved(id: string, approved: boolean): Promise<StudentDocumentData> {
    return prisma.studentDocumentData.update({
      where: { id },
      data: { reportAdminApproved: approved },
    });
  },

  async setReviewFields(id: string, data: {
    reviewActivities?: string;
    reviewCharacteristic?: string;
    reviewEmployed?: string;
    reviewNextPractice?: string;
    reviewEmploymentOffer?: string;
    reviewSuggestions?: string;
    reviewGrade?: string;
  }): Promise<StudentDocumentData> {
    return prisma.studentDocumentData.update({
      where: { id },
      data,
    });
  },
};