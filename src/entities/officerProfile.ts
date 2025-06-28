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
import { Institution } from "./Institution";

@Entity("officer_profiles")
export class OfficerProfile {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  employee_id!: string;

  @Column({ nullable: true })
  department!: string;

  @Column({ nullable: true })
  designation!: string;

  @Column({ nullable: true })
  joining_date!: Date;

  @Column()
  institution_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @OneToOne(() => User, (user) => user.officer_profile)
  @JoinColumn()
  user!: User;

  @OneToOne(() => Institution, (institution) => institution.managed_by)
  @JoinColumn({ name: "institution_id" })
  institution!: Institution;
}
