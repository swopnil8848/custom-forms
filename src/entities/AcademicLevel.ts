// src/entities/AcademicLevel.ts
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
import { Institution } from "./Institution";
import { Course } from "./Course";

@Entity("academic_levels")
export class AcademicLevel {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  institution_id!: string;

  @Column()
  name!: string; // Bachelor, Master, Grade-10, etc.

  @Column()
  code!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column({ default: 0 })
  sort_order!: number;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Institution, (institution) => institution.academic_levels)
  @JoinColumn({ name: "institution_id" })
  institution!: Institution;

  @OneToMany(() => Course, (course) => course.level)
  courses!: Course[];
}
