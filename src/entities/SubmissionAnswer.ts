// src/entities/SubmissionAnswer.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Submission } from "./Submission";
import { Question } from "./Question";

export enum GradingStatus {
  PENDING = "pending",
  GRADED = "graded",
  PARTIAL = "partial",
}

@Entity("submission_answers")
export class SubmissionAnswer {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text", { nullable: true })
  answer_text!: string;

  @Column({ nullable: true })
  file_path!: string;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  marks_obtained!: number;

  @Column("text", { nullable: true })
  feedback!: string;

  @Column({
    type: "enum",
    enum: GradingStatus,
    default: GradingStatus.PENDING,
  })
  grading_status!: GradingStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Submission, (submission) => submission.answers)
  @JoinColumn({ name: "submission_id" })
  submission!: Submission;

  @ManyToOne(() => Question)
  @JoinColumn({ name: "question_id" })
  question!: Question;
}
