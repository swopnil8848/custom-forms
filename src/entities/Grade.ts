// src/entities/Grade.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Submission } from "./Submission";
import { User } from "./User";
import { Assignment } from "./Assignment";

export enum GradeStatus {
  DRAFT = "draft",
  FINAL = "final",
  PUBLISHED = "published",
}

@Entity("grades")
export class Grade {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("decimal", { precision: 5, scale: 2 })
  total_marks!: number;

  @Column("decimal", { precision: 5, scale: 2 })
  obtained_marks!: number;

  @Column("decimal", { precision: 5, scale: 2 })
  percentage!: number;

  @Column({ nullable: true })
  letter_grade!: string;

  @Column("text", { nullable: true })
  overall_feedback!: string;

  @Column()
  graded_at!: Date;

  @Column({
    type: "enum",
    enum: GradeStatus,
    default: GradeStatus.DRAFT,
  })
  grade_status!: GradeStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToOne(() => Submission, (submission) => submission.grade)
  @JoinColumn({ name: "submission_id" })
  submission!: Submission;

  @ManyToOne(() => User, (user) => user.grades)
  @JoinColumn({ name: "student_id" })
  student!: User;

  @ManyToOne(() => Assignment)
  @JoinColumn({ name: "assignment_id" })
  assignment!: Assignment;

  @ManyToOne(() => User)
  @JoinColumn({ name: "graded_by" })
  graded_by_user!: User;
}
