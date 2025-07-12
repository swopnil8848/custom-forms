// /src/service/formSubmissionService.ts
import { AppDataSource } from "../database/database";
import { FormSubmissionData } from "../entities/FormSubmissionData";
import { FormField } from "../entities/FormField";
import AppError from "../utils/AppError";
import path from "path";
import fs from "fs";

export class FormSubmissionService {
  private static submissionRepository = AppDataSource.getRepository(FormSubmissionData);
  private static formFieldRepository = AppDataSource.getRepository(FormField);

  static async submitForm(
    formId: number,
    submissionData: { fieldId: number; value: string }[],
    files?: Express.Multer.File[]
  ): Promise<number> {
    const submissionId = Date.now(); // Simple submission ID generation
    const fileMap = new Map<number, Express.Multer.File>();

    // Map files to field IDs if provided
    if (files) {
      files.forEach((file, index) => {
        const fieldId = parseInt(file.fieldname.replace('field_', ''));
        if (!isNaN(fieldId)) {
          fileMap.set(fieldId, file);
        }
      });
    }

    // Validate and create submission data
    const submissionPromises = submissionData.map(async ({ fieldId, value }) => {
      const field = await this.formFieldRepository.findOne({
        where: { id: fieldId, formId, isActive: true },
      });

      if (!field) {
        throw new AppError(`Field with ID ${fieldId} not found`, 400);
      }

      // Check if field is required
      if (field.isRequired && (!value || value.trim() === '')) {
        throw new AppError(`Field '${field.label}' is required`, 400);
      }

      const submission = this.submissionRepository.create({
        submissionId,
        fieldId,
        value,
        fileName: fileMap.get(fieldId)?.filename || null,
      });

      return this.submissionRepository.save(submission);
    });

    await Promise.all(submissionPromises);
    return submissionId;
  }

  static async getFormSubmissions(
    formId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ submissions: any[]; total: number; page: number; limit: number }> {
    const query = this.submissionRepository.createQueryBuilder("submission")
      .leftJoinAndSelect("submission.field", "field")
      .where("field.formId = :formId", { formId })
      .orderBy("submission.submissionId", "DESC");

    const [rawSubmissions, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Group submissions by submissionId
    const groupedSubmissions = rawSubmissions.reduce((acc, submission) => {
      const { submissionId } = submission;
      if (!acc[submissionId]) {
        acc[submissionId] = {
          submissionId,
          submittedAt: submission.field.createdAt,
          data: [],
        };
      }
      acc[submissionId].data.push({
        fieldId: submission.fieldId,
        fieldLabel: submission.field.label,
        fieldType: submission.field.fieldType,
        value: submission.value,
        fileName: submission.fileName,
      });
      return acc;
    }, {} as any);

    const submissions = Object.values(groupedSubmissions);
    return { submissions, total: Math.ceil(total / limit), page, limit };
  }

  static async getSubmissionById(submissionId: number): Promise<any> {
    const submissions = await this.submissionRepository.find({
      where: { submissionId },
      relations: ["field"],
    });

    if (!submissions.length) {
      return null;
    }

    return {
      submissionId,
      formId: submissions[0].field.formId,
      submittedAt: submissions[0].field.createdAt,
      data: submissions.map(submission => ({
        fieldId: submission.fieldId,
        fieldLabel: submission.field.label,
        fieldType: submission.field.fieldType,
        value: submission.value,
        fileName: submission.fileName,
      })),
    };
  }

  static async deleteSubmission(submissionId: number): Promise<void> {
    const submissions = await this.submissionRepository.find({
      where: { submissionId },
    });

    if (!submissions.length) {
      throw new AppError("Submission not found", 404);
    }

    // Delete associated files
    for (const submission of submissions) {
      if (submission.fileName) {
        const filePath = path.join(__dirname, "../uploads", submission.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await this.submissionRepository.remove(submissions);
  }

  static async exportSubmissions(formId: number, format: string): Promise<string> {
    const submissions = await this.submissionRepository.find({
      where: { field: { formId } },
      relations: ["field"],
    });

    if (format === "csv") {
      return this.exportToCSV(submissions);
    } else if (format === "json") {
      return this.exportToJSON(submissions);
    }

    throw new AppError("Unsupported export format", 400);
  }

  private static exportToCSV(submissions: FormSubmissionData[]): string {
    if (!submissions.length) return "";

    const grouped = submissions.reduce((acc, submission) => {
      const { submissionId } = submission;
      if (!acc[submissionId]) {
        acc[submissionId] = {};
      }
      acc[submissionId][submission.field.label] = submission.value;
      return acc;
    }, {} as any);

    const allFields = [...new Set(submissions.map(s => s.field.label))];
    const csvHeader = ["Submission ID", ...allFields].join(",");
    const csvRows = Object.entries(grouped).map(([submissionId, data]: [string, any]) => {
      const row = [submissionId, ...allFields.map(field => data[field] || "")];
      return row.join(",");
    });

    return [csvHeader, ...csvRows].join("\n");
  }

  private static exportToJSON(submissions: FormSubmissionData[]): string {
    const grouped = submissions.reduce((acc, submission) => {
      const { submissionId } = submission;
      if (!acc[submissionId]) {
        acc[submissionId] = {
          submissionId,
          data: {},
        };
      }
      acc[submissionId].data[submission.field.label] = submission.value;
      return acc;
    }, {} as any);

    return JSON.stringify(Object.values(grouped), null, 2);
  }

  static async getSubmissionStats(formId: number): Promise<any> {
    const totalSubmissions = await this.submissionRepository.count({
      where: { field: { formId } },
    });

    const uniqueSubmissions = await this.submissionRepository
      .createQueryBuilder("submission")
      .leftJoin("submission.field", "field")
      .where("field.formId = :formId", { formId })
      .select("COUNT(DISTINCT submission.submissionId)", "count")
      .getRawOne();

    return {
      totalSubmissions,
      uniqueSubmissions: parseInt(uniqueSubmissions.count),
    };
  }
}