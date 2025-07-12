// /src/models/FormField.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Form } from "./Form";
import { FormSubmissionData } from "./FormSubmissionData";

export enum FieldType {
  TEXT = "text",
  EMAIL = "email",
  NUMBER = "number",
  DATE = "date",
  TEXTAREA = "textarea",
  SELECT = "select",
  RADIO = "radio",
  CHECKBOX = "checkbox",
  FILE = "file",
}

@Entity()
export class FormField {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  formId!: number;

  @ManyToOne(() => Form, (form) => form.fields, { onDelete: "CASCADE" })
  @JoinColumn({ name: "formId" })
  form!: Form;

  @Column({ length: 255 })
  label!: string;

  @Column({ length: 100 })
  fieldName!: string;

  @Column({
    type: "enum",
    enum: FieldType,
    default: FieldType.TEXT,
  })
  fieldType!: FieldType;

  @Column({ default: false })
  isRequired!: boolean;

  @Column({ type: "text", nullable: true })
  placeholder?: string;

  @Column({ type: "text", nullable: true })
  helpText?: string;

  @Column({ type: "json", nullable: true })
  options?: string[];

  @OneToMany(() => FormSubmissionData, (data) => data.submissionId, {
    cascade: true,
  })
  submissionData!: FormSubmissionData[];

  @Column({ default: 0 })
  orderNumber!: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
