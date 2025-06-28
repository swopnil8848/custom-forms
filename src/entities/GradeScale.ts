// src/entities/GradeScale.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Institution } from "./Institution";

@Entity("grade_scales")
export class GradeScale {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column()
  grade_ranges!: string; // JSON string like "A:90-100,B:80-89,etc"

  @Column({ default: false })
  is_default!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Institution, (institution) => institution.grade_scales)
  @JoinColumn({ name: "institution_id" })
  institution!: Institution;
}
