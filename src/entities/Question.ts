import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Assignment } from "./Assignment";
import { QuestionOption } from "./QuestionOption";

export enum QuestionType {
  MCQ = "mcq",
  ESSAY = "essay",
  SHORT_ANSWER = "short_answer",
  FILE_UPLOAD = "file_upload",
  TRUE_FALSE = "true_false",
  MATCHING = "matching",
}

@Entity("questions")
export class Question {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column("text")
  question_text!: string;

  @Column({
    type: "enum",
    enum: QuestionType,
    default: QuestionType.SHORT_ANSWER,
  })
  question_type!: QuestionType;

  @Column("decimal", { precision: 5, scale: 2, default: 1 })
  marks!: number;

  @Column({ default: 0 })
  sort_order!: number;

  @Column({ default: true })
  is_required!: boolean;

  @Column("text", { nullable: true })
  grading_criteria!: string;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Assignment, (assignment) => assignment.questions)
  @JoinColumn({ name: "assignment_id" })
  assignment!: Assignment;

  @ManyToOne(() => Question)
  @JoinColumn({ name: "parent_question_id" })
  parent_question!: Question;

  @OneToMany(() => Question, (question) => question.parent_question)
  sub_questions!: Question[];

  @OneToMany(() => QuestionOption, (option) => option.question)
  options!: QuestionOption[];
}
