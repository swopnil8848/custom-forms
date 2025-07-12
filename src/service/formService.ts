// /src/service/formService.ts
import { AppDataSource } from "../database/database";
import { Form } from "../entities/Form";
import { FormField } from "../entities/FormField";
import AppError from "../utils/AppError";

export class FormService {
  private static formRepository = AppDataSource.getRepository(Form);

  static async createForm(data: Partial<Form>): Promise<Form> {
    const newForm = this.formRepository.create(data);
    return await this.formRepository.save(newForm);
  }

  static async getFormById(id: number): Promise<Form | null> {
    return await this.formRepository.findOne({
      where: { id },
      relations: ["fields", "creator"],
    });
  }

  static async getForms(
    filters: { createdBy?: number; isPublished?: boolean },
    page: number = 1,
    limit: number = 10
  ): Promise<{ forms: Form[]; total: number; page: number; limit: number }> {
    const query = this.formRepository.createQueryBuilder("form")
      .leftJoinAndSelect("form.fields", "fields")
      .leftJoinAndSelect("form.creator", "creator")
      .where("form.isActive = :isActive", { isActive: true });

    if (filters.createdBy) {
      query.andWhere("form.createdBy = :createdBy", { createdBy: filters.createdBy });
    }

    if (filters.isPublished !== undefined) {
      query.andWhere("form.isPublished = :isPublished", { 
        isPublished: filters.isPublished 
      });
    }

    query.orderBy("form.createdAt", "DESC");
    
    const [forms, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { forms, total, page, limit };
  }

  static async updateForm(id: number, data: Partial<Form>): Promise<Form> {
    const form = await this.getFormById(id);
    if (!form) {
      throw new AppError("Form not found", 404);
    }

    Object.assign(form, data);
    return await this.formRepository.save(form);
  }

  static async deleteForm(id: number): Promise<void> {
    const form = await this.getFormById(id);
    if (!form) {
      throw new AppError("Form not found", 404);
    }

    form.isActive = false;
    await this.formRepository.save(form);
  }

//   static async publishForm(id: number): Promise<Form> {
//     const form = await this.getFormById(id);
//     if (!form) {
//       throw new AppError("Form not found", 404);
//     }

//     form.isPublished = true;
//     form.publishedAt = new Date();
//     return await this.formRepository.save(form);
//   }

//   static async unpublishForm(id: number): Promise<Form> {
//     const form = await this.getFormById(id);
//     if (!form) {
//       throw new AppError("Form not found", 404);
//     }

//     form.isPublished = false;
//     return await this.formRepository.save(form);
//   }

//   static async getPublicForms(
//     page: number = 1,
//     limit: number = 10
//   ): Promise<{ forms: Form[]; total: number; page: number; limit: number }> {
//     const query = this.formRepository.createQueryBuilder("form")
//       .leftJoinAndSelect("form.fields", "fields")
//       .leftJoinAndSelect("form.creator", "creator")
//       .where("form.isActive = :isActive", { isActive: true })
//       .andWhere("form.isPublished = :isPublished", { isPublished: true })
//       .andWhere("(form.expiresAt IS NULL OR form.expiresAt > :now)", { now: new Date() })
//       .orderBy("form.publishedAt", "DESC");
    
//     const [forms, total] = await query
//       .skip((page - 1) * limit)
//       .take(limit)
//       .getManyAndCount();

//     return { forms, total, page, limit };
//   }
}