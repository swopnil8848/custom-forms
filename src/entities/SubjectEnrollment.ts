import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Subject } from './Subject';
import { StudentProfile } from './StudentProfile';
import { User } from './User';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
}

@Entity('subject_enrollments')
export class SubjectEnrollment {
  @PrimaryGeneratedColumn('uuid')
  enrollment_id!: string;

  @Column()
  subject_id!: string;

  @Column()
  student_id!: string;

  @Column()
  enrolled_by!: string;

  @Column()
  enrollment_date!: Date;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status!: EnrollmentStatus;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Subject, (subject) => subject.enrollments)
  @JoinColumn({ name: 'subject_id' })
  subject!: Subject;

  @ManyToOne(() => StudentProfile, (profile) => profile.subject_enrollments)
  @JoinColumn()
  student!: StudentProfile;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'enrolled_by' })
  enrolled_by_user!: User;
}
