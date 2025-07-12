// /src/service/formFieldService.ts
import { AppDataSource } from "../database/database";
import { FormField } from "../entities/FormField";
import AppError from "../utils/AppError";

export class FormFieldService {
  private static formFieldRepository = AppDataSource.getRepository(FormField);

  static async createFormField(data: Partial<FormField>): Promise<FormField> {
    const newFormField = this.formFieldRepository.create(data);
    return await this.formFieldRepository.save(newFormField);
  }

  static async getFormFieldById(id: number): Promise<FormField | null> {
    return await this.formFieldRepository.findOne({
      where: { id },
      relations: ["form"],
    });
  }

  static async getFormFieldsByFormId(formId: number): Promise<FormField[]> {
    return await this.formFieldRepository.find({
      where: { formId, isActive: true },
      order: { orderNumber: "ASC" },
    });
  }

  static async updateFormField(id: number, data: Partial<FormField>): Promise<FormField> {
    const formField = await this.getFormFieldById(id);
    if (!formField) {
      throw new AppError("Form field not found", 404);
    }

    Object.assign(formField, data);
    return await this.formFieldRepository.save(formField);
  }

  static async deleteFormField(id: number): Promise<void> {
    const formField = await this.getFormFieldById(id);
    if (!formField) {
      throw new AppError("Form field not found", 404);
    }

    formField.isActive = false;
    await this.formFieldRepository.save(formField);
  }

  static async reorderFormFields(
    formId: number,
    fieldOrders: { fieldId: number; orderNumber: number }[]
  ): Promise<FormField[]> {
    const updatePromises = fieldOrders.map(async ({ fieldId, orderNumber }) => {
      const field = await this.getFormFieldById(fieldId);
      if (field && field.formId === formId) {
        field.orderNumber = orderNumber;
        return this.formFieldRepository.save(field);
      }
      return null;
    });

    await Promise.all(updatePromises);
    return await this.getFormFieldsByFormId(formId);
  }
}
