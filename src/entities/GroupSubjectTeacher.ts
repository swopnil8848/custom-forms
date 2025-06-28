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
import { Subject } from "./Subject";
import { TeacherProfile } from "./TeacherProfile";
import { User } from "./User";

export enum TeacherRoleType {
  PRIMARY = "primary",
  ASSISTANT = "assistant",
  SUBSTITUTE = "substitute",
}

@Entity("group_subject_teachers")
export class GroupSubjectTeacher {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  assignment_date!: Date;

  @Column({
    type: "enum",
    enum: TeacherRoleType,
    default: TeacherRoleType.PRIMARY,
  })
  role_type!: TeacherRoleType;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Group, (group) => group.subject_teachers)
  @JoinColumn()
  group!: Group;

  @ManyToOne(() => Subject, (subject) => subject.group_teachers)
  @JoinColumn()
  subject!: Subject;

  @ManyToOne(() => TeacherProfile, (profile) => profile.teaching_assignments)
  @JoinColumn()
  teacher!: TeacherProfile;

  @ManyToOne(() => User)
  @JoinColumn()
  assigned_by_user!: User;
}
