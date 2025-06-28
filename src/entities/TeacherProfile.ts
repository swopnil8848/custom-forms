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
import { GroupSubjectTeacher } from "./GroupSubjectTeacher";

@Entity("teacher_profiles")
export class TeacherProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  employee_id!: string;

  @Column({ nullable: true })
  department!: string;

  @Column({ nullable: true })
  designation!: string;

  @Column("text", { nullable: true })
  qualification!: string;

  @Column({ nullable: true })
  joining_date!: Date;

  @Column("text", { nullable: true })
  specializations!: string;

  @Column("text", { nullable: true })
  certifications!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToOne(() => User, (user) => user.teacher_profile)
  @JoinColumn() // TypeORM will create "userId" column automatically
  user!: User;

  @OneToMany(() => GroupSubjectTeacher, (assignment) => assignment.teacher)
  teaching_assignments!: GroupSubjectTeacher[];
}
