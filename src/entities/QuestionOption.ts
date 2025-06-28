// src/entities/QuestionOption.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Question } from "./Question";

@Entity("question_options")
export class QuestionOption {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  option_text!: string;

  @Column({ default: false })
  is_correct!: boolean;

  @Column({ default: 0 })
  sort_order!: number;

  @Column("decimal", { precision: 5, scale: 2, default: 0 })
  partial_marks!: number;

  @Column("text", { nullable: true })
  explanation!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Question, (question) => question.options)
  @JoinColumn({ name: "question_id" })
  question!: Question;
}
