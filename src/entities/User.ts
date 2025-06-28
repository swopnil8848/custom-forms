import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { StudentProfile } from "./StudentProfile";
import { TeacherProfile } from "./TeacherProfile";
import { OfficerProfile } from "./officerProfile";
import { GroupMember } from "./GroupMember";
import { Submission } from "./Submission";
import { Grade } from "./Grade";
import { Resource } from "./Resource";
import { Notification } from "./Notification";

export enum UserRole {
  ADMIN = "admin",
  OFFICER = "officer",
  TEACHER = "teacher",
  STUDENT = "student",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column({ nullable: true })
  middleName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Column({
    type: "boolean",
    default: false,
  })
  isVerified!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  passwordChangedAt?: Date;

  @Column({
    type: String,
    nullable: true,
  })
  emailVerificationToken!: String | null;

  @Column({
    type: String,
    nullable: true,
  })
  passwordResetToken!: String | null;

  // Relations
  @OneToOne(() => StudentProfile, (profile) => profile.user)
  student_profile!: StudentProfile;

  @OneToOne(() => TeacherProfile, (profile) => profile.user)
  teacher_profile!: TeacherProfile;

  @OneToOne(() => OfficerProfile, (profile) => profile.user)
  officer_profile!: OfficerProfile;

  @OneToMany(() => GroupMember, (member) => member.user)
  group_memberships!: GroupMember[];

  @OneToMany(() => Submission, (submission) => submission.student)
  submissions!: Submission[];

  @OneToMany(() => Grade, (grade) => grade.student)
  grades!: Grade[];

  @OneToMany(() => Resource, (resource) => resource.uploaded_by)
  uploaded_resources!: Resource[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  // Helper methods
  get full_name(): string {
    return `${this.firstName} ${this.middleName} ${this.lastName}`;
  }
}
