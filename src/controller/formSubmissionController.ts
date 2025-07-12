import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import { FormSubmissionService } from "../service/formSubmissionService";
import { FormService } from "../service/formService";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { createFormSubmissionDto } from "../dto/formSubmissionDto/formSubmissionDto";
import upload from "../utils/upload";

export class FormSubmissionController {
  static async submitForm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formId = parseInt(req.params.formId);
      if (isNaN(formId)) {
        return next(new AppError("Invalid form ID", 400));
      }

      // Check if form exists and is published
      const form = await FormService.getFormById(formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (!form.isPublished) {
        return next(new AppError("Form is not published", 400));
      }

      // Check if form is expired
      if (form.expiresAt && new Date() > form.expiresAt) {
        return next(new AppError("Form has expired", 400));
      }

      const submissionDto = plainToClass(createFormSubmissionDto, req.body);
      const errors = await validate(submissionDto);

      if (errors.length > 0) {
        return next(new AppError("Validation Failed", 400, errors));
      }

      const { submissionData } = req.body;
      if (!Array.isArray(submissionData)) {
        return next(new AppError("Submission data must be an array", 400));
      }

      // Handle file uploads if present
      const files = req.files as Express.Multer.File[];
      const submissionId = await FormSubmissionService.submitForm(
        formId,
        submissionData,
        files
      );

      return res.status(201).json({
        status: "success",
        message: "Form submitted successfully",
        data: { submissionId },
      });
    } catch (error) {
      console.log("error:> ", error);
      return next(new AppError("Error submitting form", 500));
    }
  }

  static async getFormSubmissions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formId = parseInt(req.params.formId);
      if (isNaN(formId)) {
        return next(new AppError("Invalid form ID", 400));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      // Check if form exists and user owns it
      const form = await FormService.getFormById(formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      const { page = 1, limit = 10 } = req.query;
      const submissions = await FormSubmissionService.getFormSubmissions(
        formId,
        Number(page),
        Number(limit)
      );

      return res.status(200).json({
        status: "success",
        data: submissions,
      });
    } catch (error) {
      return next(new AppError("Error fetching form submissions", 500));
    }
  }

  static async getSubmissionById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const submissionId = parseInt(req.params.id);
      if (isNaN(submissionId)) {
        return next(new AppError("Invalid submission ID", 400));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const submission = await FormSubmissionService.getSubmissionById(submissionId);

      if (!submission) {
        return next(new AppError("Submission not found", 404));
      }

      // Check if user owns the form
      const form = await FormService.getFormById(submission.formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      return res.status(200).json({
        status: "success",
        data: submission,
      });
    } catch (error) {
      return next(new AppError("Error fetching submission", 500));
    }
  }

  static async deleteSubmission(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const submissionId = parseInt(req.params.id);
      if (isNaN(submissionId)) {
        return next(new AppError("Invalid submission ID", 400));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const submission = await FormSubmissionService.getSubmissionById(submissionId);

      if (!submission) {
        return next(new AppError("Submission not found", 404));
      }

      // Check if user owns the form
      const form = await FormService.getFormById(submission.formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      await FormSubmissionService.deleteSubmission(submissionId);

      return res.status(200).json({
        status: "success",
        message: "Submission deleted successfully",
      });
    } catch (error) {
      return next(new AppError("Error deleting submission", 500));
    }
  }

  static async exportSubmissions(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formId = parseInt(req.params.formId);
      if (isNaN(formId)) {
        return next(new AppError("Invalid form ID", 400));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      // Check if form exists and user owns it
      const form = await FormService.getFormById(formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      const { format = "csv" } = req.query;
      const exportData = await FormSubmissionService.exportSubmissions(
        formId,
        format as string
      );

      if (format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="form_${formId}_submissions.csv"`
        );
      } else if (format === "json") {
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="form_${formId}_submissions.json"`
        );
      }

      return res.status(200).send(exportData);
    } catch (error) {
      return next(new AppError("Error exporting submissions", 500));
    }
  }

  static async getSubmissionStats(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formId = parseInt(req.params.formId);
      if (isNaN(formId)) {
        return next(new AppError("Invalid form ID", 400));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      // Check if form exists and user owns it
      const form = await FormService.getFormById(formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      const stats = await FormSubmissionService.getSubmissionStats(formId);

      return res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (error) {
      return next(new AppError("Error fetching submission stats", 500));
    }
  }
}