import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { StudentBatchEnrollment } from "./StudentBatchEnrollment";
import { SubjectEnrollment } from "./SubjectEnrollment";

@Entity("student_profiles")
export class StudentProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  student_id!: string;

  @Column({ nullable: true })
  guardian_name!: string;

  @Column({ nullable: true })
  guardian_phone!: string;

  @Column({ nullable: true })
  guardian_email!: string;

  @Column({ nullable: true })
  date_of_birth!: Date;

  @Column("text", { nullable: true })
  address!: string;

  @Column({ nullable: true })
  emergency_contact!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToOne(() => User, (user) => user.student_profile)
  @JoinColumn()
  user!: User;

  @OneToMany(() => StudentBatchEnrollment, (enrollment) => enrollment.student)
  batch_enrollments!: StudentBatchEnrollment[];

  @OneToMany(() => SubjectEnrollment, (enrollment) => enrollment.student)
  subject_enrollments!: SubjectEnrollment[];
}
