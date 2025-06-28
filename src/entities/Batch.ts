// src/entities/Batch.ts
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
import { Course } from "./Course";
import { Group } from "./Group";
import { StudentBatchEnrollment } from "./StudentBatchEnrollment";

@Entity("batches")
export class Batch {
  @PrimaryGeneratedColumn("uuid")
  batch_id!: string;

  @Column()
  course_id!: string;

  @Column()
  name!: string; // 2024-CS-A, 2023-Math-B, etc.

  @Column({ unique: true })
  code!: string;

  @Column()
  batch_year!: number;

  @Column()
  start_date!: Date;

  @Column()
  end_date!: Date;

  @Column({ default: 0 })
  max_students!: number;

  @Column({ default: 0 })
  current_enrollment!: number;

  @Column("text", { nullable: true })
  description!: string;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Course, (course) => course.batches)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @OneToMany(() => Group, (group) => group.batch)
  groups!: Group[];

  @OneToMany(() => StudentBatchEnrollment, (enrollment) => enrollment.batch)
  student_enrollments!: StudentBatchEnrollment[];
}
