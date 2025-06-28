// src/entities/GroupMember.ts - THIS IS THE KEY MISSING PIECE!
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Group } from "./Group";
import { User } from "./User";

export enum MemberType {
  STUDENT = "student",
  TEACHER = "teacher",
  COORDINATOR = "coordinator",
  ADMIN = "admin",
  STAFF = "staff",
}

export enum MemberRole {
  PRIMARY = "primary",
  ASSISTANT = "assistant",
  OBSERVER = "observer",
}

@Entity("group_members")
export class GroupMember {
  @PrimaryGeneratedColumn()
  member_id!: string;

  @Column()
  group_id!: string;

  @Column({
    type: "enum",
    enum: MemberType,
    default: MemberType.STUDENT,
  })
  member_type!: MemberType;

  @Column({
    type: "enum",
    enum: MemberRole,
    default: MemberRole.PRIMARY,
  })
  role!: MemberRole;

  @Column()
  assigned_date!: Date;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Group, (group) => group.members)
  @JoinColumn({ name: "group_id" })
  group!: Group;

  @ManyToOne(() => User, (user) => user.group_memberships)
  @JoinColumn()
  user!: User;
}
