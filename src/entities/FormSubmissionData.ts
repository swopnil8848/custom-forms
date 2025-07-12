// /src/models/FormSubmissionData.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { FormField } from "./FormField";

@Entity()
export class FormSubmissionData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  submissionId!: number;

  @Column()
  fieldId!: number;

  @ManyToOne(() => FormField, { nullable: false })
  @JoinColumn({ name: "fieldId" })
  field!: FormField;

  @Column({ type: "text" })
  value!: string;

  @Column({ type: "text", nullable: true })
  fileName?: string | null; // For file uploads
}
