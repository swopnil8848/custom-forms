import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import { FormFieldService } from "../service/formFieldService";
import { FormService } from "../service/formService";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { createFormFieldDto, updateFormFieldDto } from "../dto/formFieldDto/formFieldDto";

export class FormFieldController {
  static async createFormField(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const formFieldDto = plainToClass(createFormFieldDto, req.body);
      const errors = await validate(formFieldDto);

      if (errors.length > 0) {
        return next(new AppError("Validation Failed", 400, errors));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const formId = parseInt(req.params.formId);
      if (isNaN(formId)) {
        return next(new AppError("Invalid form ID", 400));
      }

      // Check if form exists and user owns it
      const form = await FormService.getFormById(formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      const formFieldData = {
        ...req.body,
        formId: formId,
      };

      const formField = await FormFieldService.createFormField(formFieldData);

      return res.status(201).json({
        status: "success",
        message: "Form field created successfully",
        data: formField,
      });
    } catch (error) {
      console.log("error:> ", error);
      return next(new AppError("Error creating form field", 500));
    }
  }

  static async getFormFields(
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

      // Check if form exists and user has access
      const form = await FormService.getFormById(formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId && !form.isPublished) {
        return next(new AppError("Access denied", 403));
      }

      const formFields = await FormFieldService.getFormFieldsByFormId(formId);

      return res.status(200).json({
        status: "success",
        data: formFields,
      });
    } catch (error) {
      return next(new AppError("Error fetching form fields", 500));
    }
  }

  static async getFormFieldById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return next(new AppError("Invalid field ID", 400));
      }

      const formField = await FormFieldService.getFormFieldById(fieldId);

      if (!formField) {
        return next(new AppError("Form field not found", 404));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      // Check if user owns the form
      const form = await FormService.getFormById(formField.formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId && !form.isPublished) {
        return next(new AppError("Access denied", 403));
      }

      return res.status(200).json({
        status: "success",
        data: formField,
      });
    } catch (error) {
      return next(new AppError("Error fetching form field", 500));
    }
  }

  static async updateFormField(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return next(new AppError("Invalid field ID", 400));
      }

      const formFieldDto = plainToClass(updateFormFieldDto, req.body);
      const errors = await validate(formFieldDto);

      if (errors.length > 0) {
        return next(new AppError("Validation Failed", 400, errors));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const existingField = await FormFieldService.getFormFieldById(fieldId);
      if (!existingField) {
        return next(new AppError("Form field not found", 404));
      }

      // Check if user owns the form
      const form = await FormService.getFormById(existingField.formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      const updatedField = await FormFieldService.updateFormField(fieldId, req.body);

      return res.status(200).json({
        status: "success",
        message: "Form field updated successfully",
        data: updatedField,
      });
    } catch (error) {
      return next(new AppError("Error updating form field", 500));
    }
  }

  static async deleteFormField(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    try {
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return next(new AppError("Invalid field ID", 400));
      }

      const userId = req.user?.id;
      if (!userId) {
        return next(new AppError("User not authenticated", 401));
      }

      const existingField = await FormFieldService.getFormFieldById(fieldId);
      if (!existingField) {
        return next(new AppError("Form field not found", 404));
      }

      // Check if user owns the form
      const form = await FormService.getFormById(existingField.formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      await FormFieldService.deleteFormField(fieldId);

      return res.status(200).json({
        status: "success",
        message: "Form field deleted successfully",
      });
    } catch (error) {
      return next(new AppError("Error deleting form field", 500));
    }
  }

  static async reorderFormFields(
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

      const { fieldOrders } = req.body;
      if (!Array.isArray(fieldOrders)) {
        return next(new AppError("Field orders must be an array", 400));
      }

      // Check if form exists and user owns it
      const form = await FormService.getFormById(formId);
      if (!form) {
        return next(new AppError("Form not found", 404));
      }

      if (form.createdBy !== userId) {
        return next(new AppError("Access denied", 403));
      }

      const reorderedFields = await FormFieldService.reorderFormFields(formId, fieldOrders);

      return res.status(200).json({
        status: "success",
        message: "Form fields reordered successfully",
        data: reorderedFields,
      });
    } catch (error) {
      return next(new AppError("Error reordering form fields", 500));
    }
  }
}