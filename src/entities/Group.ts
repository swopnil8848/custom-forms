// src/entities/Group.ts
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
import { Batch } from "./Batch";
import { GroupMember } from "./GroupMember";
import { Assignment } from "./Assignment";
import { GroupSubjectTeacher } from "./GroupSubjectTeacher";
import { User } from "./User";

@Entity("groups")
export class Group {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  batch_id!: string;

  @Column()
  created_by!: string;

  @Column()
  name!: string; // 10A, 10B, CS-A, etc.

  @Column({ unique: true })
  code!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column({ default: 50 })
  max_capacity!: number;

  @Column({ default: 0 })
  current_enrollment!: number;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Batch, (batch) => batch.groups)
  @JoinColumn({ name: "batch_id" })
  batch!: Batch;

  @ManyToOne(() => User)
  @JoinColumn({ name: "created_by" })
  creator!: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members!: GroupMember[];

  @OneToMany(() => Assignment, (assignment) => assignment.group)
  assignments!: Assignment[];

  @OneToMany(() => GroupSubjectTeacher, (teacher) => teacher.group)
  subject_teachers!: GroupSubjectTeacher[];
}
