// src/entities/StudentGroupAssignment.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Group } from "./Group";

export enum AssignmentStatus {
  ACTIVE = "active",
  TRANSFERRED = "transferred",
  INACTIVE = "inactive",
}

@Entity("student_group_assignments")
export class StudentGroupAssignment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  assignment_date!: Date;

  @Column({
    type: "enum",
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE,
  })
  status!: AssignmentStatus;

  @Column({ default: true })
  is_current!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: "student_id" })
  student!: User;

  @ManyToOne(() => Group)
  @JoinColumn({ name: "group_id" })
  group!: Group;

  @ManyToOne(() => User)
  @JoinColumn({ name: "assigned_by" })
  assigned_by_user!: User;
}
