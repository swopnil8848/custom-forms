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
import { Subject } from "./Subject";
import { Group } from "./Group";
import { User } from "./User";
import { Question } from "./Question";
import { Submission } from "./Submission";

export enum AssignmentType {
  HOMEWORK = "homework",
  QUIZ = "quiz",
  EXAM = "exam",
  PROJECT = "project",
  PRACTICAL = "practical",
}

export enum GradingType {
  AUTO = "auto",
  MANUAL = "manual",
  HYBRID = "hybrid",
}

@Entity("assignments")
export class Assignment {
  @PrimaryGeneratedColumn("uuid")
  assignment_id!: string;

  @Column()
  subject_id!: string;

  @Column()
  group_id!: string;

  @Column()
  created_by!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column("text", { nullable: true })
  instructions!: string;

  @Column({
    type: "enum",
    enum: AssignmentType,
    default: AssignmentType.HOMEWORK,
  })
  assignment_type!: AssignmentType;

  @Column({ default: 100 })
  total_marks!: number;

  @Column()
  due_date!: Date;

  @Column()
  start_date!: Date;

  @Column({ default: false })
  allow_late_submission!: boolean;

  @Column({ default: 0 })
  late_penalty_percent!: number;

  @Column({ default: 1 })
  max_attempts!: number;

  @Column({ default: false })
  is_published!: boolean;

  @Column({
    type: "enum",
    enum: GradingType,
    default: GradingType.MANUAL,
  })
  grading_type!: GradingType;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Subject, (subject) => subject.assignments)
  @JoinColumn({ name: "subject_id" })
  subject!: Subject;

  @ManyToOne(() => Group, (group) => group.assignments)
  @JoinColumn({ name: "group_id" })
  group!: Group;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  creator!: User;

  @OneToMany(() => Question, (question) => question.assignment)
  questions!: Question[];

  @OneToMany(() => Submission, (submission) => submission.assignment)
  submissions!: Submission[];
}
