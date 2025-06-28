// src/entities/Subject.ts
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
import { Institution } from "./Institution";
import { Assignment } from "./Assignment";
import { SubjectEnrollment } from "./SubjectEnrollment";
import { GroupSubjectTeacher } from "./GroupSubjectTeacher";

export enum SubjectType {
  CORE = "core",
  ELECTIVE = "elective",
  PRACTICAL = "practical",
  THEORY = "theory",
}

@Entity("subjects")
export class Subject {
  @PrimaryGeneratedColumn("uuid")
  subject_id!: string;

  @Column()
  course_id!: string;

  @Column()
  institution_id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column({ default: 3 })
  credits!: number;

  @Column({ default: 1 })
  semester!: number;

  @Column({
    type: "enum",
    enum: SubjectType,
    default: SubjectType.CORE,
  })
  subject_type!: SubjectType;

  @Column("text", { nullable: true })
  prerequisites!: string;

  @Column("text", { nullable: true })
  learning_outcomes!: string;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Course, (course) => course.subjects)
  @JoinColumn({ name: "course_id" })
  course!: Course;

  @ManyToOne(() => Institution, (institution) => institution.subjects)
  @JoinColumn({ name: "institution_id" })
  institution!: Institution;

  @OneToMany(() => Assignment, (assignment) => assignment.subject)
  assignments!: Assignment[];

  @OneToMany(() => SubjectEnrollment, (enrollment) => enrollment.subject)
  enrollments!: SubjectEnrollment[];

  @OneToMany(() => GroupSubjectTeacher, (teacher) => teacher.subject)
  group_teachers!: GroupSubjectTeacher[];
}
