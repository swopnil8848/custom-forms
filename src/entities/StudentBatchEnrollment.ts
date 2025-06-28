// src/entities/StudentBatchEnrollment.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { StudentProfile } from "./StudentProfile";
import { Batch } from "./Batch";
import { User } from "./User";

export enum EnrollmentStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  TRANSFERRED = "transferred",
  DROPPED = "dropped",
  GRADUATED = "graduated",
}

@Entity("student_batch_enrollments")
export class StudentBatchEnrollment {
  @PrimaryGeneratedColumn("uuid")
  enrollment_id!: string;

  @Column()
  student_id!: string;

  @Column()
  batch_id!: string;

  @Column()
  enrolled_by!: string;

  @Column({ unique: true })
  roll_number!: string;

  @Column()
  enrollment_date!: Date;

  @Column({
    type: "enum",
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status!: EnrollmentStatus;

  @Column({ default: false })
  is_current!: boolean;

  @Column("text", { nullable: true })
  remarks!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => StudentProfile, (profile) => profile.batch_enrollments)
  @JoinColumn()
  student!: StudentProfile;

  @ManyToOne(() => Batch, (batch) => batch.student_enrollments)
  @JoinColumn({ name: "batch_id" })
  batch!: Batch;

  @ManyToOne(() => User)
  @JoinColumn({ name: "enrolled_by" })
  enrolled_by_user!: User;
}
