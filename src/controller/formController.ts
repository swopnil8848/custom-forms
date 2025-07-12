import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import { FormService } from "../service/formService";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { createFormDto, updateFormDto } from "../dto/formDto/formDto";

export class FormController {
  static async createForm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formDto = plainToClass(createFormDto, req.body);
      const errors = await validate(formDto);

      if (errors.length > 0) {
        return next(new AppError("Vali dation Failed", 400, errors));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const formData = {
        ...req.body,
        createdBy: userId,
      };

      const form = await FormService.createForm(formData);

      return res.status(201).json({
        status: "success",
        message: "Form created successfully",
        data: form,
      });
    } catch (error) {
      console.log("error:> ", error);
      return next(new AppError("Error creating form", 500));
    }
  }

  static async getForms(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const { page = 1, limit = 10, isPublished } = req.query;
      const filters = {
        createdBy: userId,
        isPublished: isPublished ? Boolean(isPublished) : undefined,
      };

      const forms = await FormService.getForms(
        filters,
        Number(page),
        Number(limit)
      );

      return res.status(200).json({
        status: "success",
        data: forms,
      });
    } catch (error) {
      return next(new AppError("Error fetching forms", 500));
    }
  }

  static async getFormById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return next(new AppError("Invalid form ID", 400));
      }

      const form = await FormService.getFormById(formId);

      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      // Check if user owns the form or if form is published
      const userId = req.user?.id;
      if (form.createdBy !== userId && !form.isPublished) {
        return next(new AppError("Access denied", 403));
      }

      return res.status(200).json({
        status: "success",
        data: form,
      });
    } catch (error) {
      return next(new AppError("Error fetching form", 500));
    }
  }

  static async updateForm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return next(new AppError("Invalid form ID", 400));
      }

      const formDto = plainToClass(updateFormDto, req.body);
      const errors = await validate(formDto);

      if (errors.length > 0) {
        return next(new AppError("Validation Failed", 400, errors));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const existingForm = await FormService.getFormById(formId);
      if (!existingForm) {
        return next(new AppError("Form not found", 404));
      }

      if (existingForm.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      const updatedForm = await FormService.updateForm(formId, req.body);

      return res.status(200).json({
        status: "success",
        message: "Form updated successfully",
        data: updatedForm,
      });
    } catch (error) {
      return next(new AppError("Error updating form", 500));
    }
  }

  static async deleteForm(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formId = parseInt(req.params.id);
      if (isNaN(formId)) {
        return next(new AppError("Invalid form ID", 400));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const existingForm = await FormService.getFormById(formId);
      if (!existingForm) {
        return next(new AppError("Form not found", 404));
      }

      if (existingForm.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      await FormService.deleteForm(formId);

      return res.status(200).json({
        status: "success",
        message: "Form deleted successfully",
      });
    } catch (error) {
      return next(new AppError("Error deleting form", 500));
    }
  }

  //   static async publishForm(
  //     req: Request,
  //     res: Response,
  //     next: NextFunction
  //   ): Promise<any> {
  //     try {
  //       const formId = parseInt(req.params.id);
  //       if (isNaN(formId)) {
  //         return next(new AppError("Invalid form ID", 400));
  //       }

  //       const userId = req.user?.id;
  //       if (!userId) {
  //         return next(new AppError("User not authenticated", 401));
  //       }

  //       const existingForm = await FormService.getFormById(formId);
  //       if (!existingForm) {
  //         return next(new AppError("Form not found", 404));
  //       }

  //       if (existingForm.createdBy !== userId) {
  //         return next(new AppError("Access denied", 403));
  //       }

  //       const publishedForm = await FormService.publishForm(formId);

  //       return res.status(200).json({
  //         status: "success",
  //         message: "Form published successfully",
  //         data: publishedForm,
  //       });
  //     } catch (error) {
  //       return next(new AppError("Error publishing form", 500));
  //     }
  //   }

  //   static async unpublishForm(
  //     req: Request,
  //     res: Response,
  //     next: NextFunction
  //   ): Promise<any> {
  //     try {
  //       const formId = parseInt(req.params.id);
  //       if (isNaN(formId)) {
  //         return next(new AppError("Invalid form ID", 400));
  //       }

  //       const userId = req.user?.id;
  //       if (!userId) {
  //         return next(new AppError("User not authenticated", 401));
  //       }

  //       const existingForm = await FormService.getFormById(formId);
  //       if (!existingForm) {
  //         return next(new AppError("Form not found", 404));
  //       }

  //       if (existingForm.createdBy !== userId) {
  //         return next(new AppError("Access denied", 403));
  //       }

  //       const unpublishedForm = await FormService.unpublishForm(formId);

  //       return res.status(200).json({
  //         status: "success",
  //         message: "Form unpublished successfully",
  //         data: unpublishedForm,
  //       });
  //     } catch (error) {
  //       return next(new AppError("Error unpublishing form", 500));
  //     }
  //   }

  //   static async getPublicForms(
  //     req: Request,
  //     res: Response,
  //     next: NextFunction
  //   ): Promise<any> {
  //     try {
  //       const { page = 1, limit = 10 } = req.query;
  //       const forms = await FormService.getPublicForms(Number(page), Number(limit));

  //       return res.status(200).json({
  //         status: "success",
  //         data: forms,
  //       });
  //     } catch (error) {
  //       return next(new AppError("Error fetching public forms", 500));
  //     }
  //   }
}
