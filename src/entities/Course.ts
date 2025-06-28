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
import { AcademicLevel } from "./AcademicLevel";
import { Batch } from "./Batch";
import { Subject } from "./Subject";

@Entity("courses")
export class Course {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  level_id!: string;

  @Column()
  name!: string; // Computer Science, Mathematics, etc.

  @Column({ unique: true })
  code!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column({ default: 8 })
  duration_semesters!: number;

  @Column("text", { nullable: true })
  curriculum_overview!: string;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => AcademicLevel, (level) => level.courses)
  @JoinColumn({ name: "level_id" })
  level!: AcademicLevel;

  @OneToMany(() => Batch, (batch) => batch.course)
  batches!: Batch[];

  @OneToMany(() => Subject, (subject) => subject.course)
  subjects!: Subject[];
}
