// src/entities/Institution.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";
import { AcademicLevel } from "./AcademicLevel";
import { Subject } from "./Subject";
import { GradeScale } from "./GradeScale";
import { OfficerProfile } from "./officerProfile";

export enum InstitutionType {
  SCHOOL = "school",
  UNIVERSITY = "university",
  COLLEGE = "college",
}

@Entity("institutions")
export class Institution {
  @PrimaryGeneratedColumn("uuid")
  institution_id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  code!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column("text", { nullable: true })
  address!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ nullable: true })
  email!: string;

  @Column({
    type: "enum",
    enum: InstitutionType,
    default: InstitutionType.SCHOOL,
  })
  type!: InstitutionType;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToOne(() => OfficerProfile, (profile) => profile.institution)
  managed_by!: OfficerProfile;

  @OneToMany(() => AcademicLevel, (level) => level.institution)
  academic_levels!: AcademicLevel[];

  @OneToMany(() => Subject, (subject) => subject.institution)
  subjects!: Subject[];

  @OneToMany(() => GradeScale, (scale) => scale.institution)
  grade_scales!: GradeScale[];
}
