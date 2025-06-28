// src/entities/Submission.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Assignment } from "./Assignment";
import { User } from "./User";
import { SubmissionAnswer } from "./SubmissionAnswer";
import { Grade } from "./Grade";

export enum SubmissionStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  GRADED = "graded",
  RETURNED = "returned",
}

@Entity("submissions")
export class Submission {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    type: "enum",
    enum: SubmissionStatus,
    default: SubmissionStatus.DRAFT,
  })
  status!: SubmissionStatus;

  @Column({ nullable: true })
  submitted_at!: Date;

  @Column()
  last_modified!: Date;

  @Column({ default: 1 })
  attempt_number!: number;

  @Column({ default: false })
  is_late!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Assignment, (assignment) => assignment.submissions)
  @JoinColumn({ name: "assignment_id" })
  assignment!: Assignment;

  @ManyToOne(() => User, (user) => user.submissions)
  @JoinColumn({ name: "student_id" })
  student!: User;

  @OneToMany(() => SubmissionAnswer, (answer) => answer.submission)
  answers!: SubmissionAnswer[];

  @OneToOne(() => Grade, (grade) => grade.submission)
  grade!: Grade;
}
