// src/entities/AuditLog.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Institution } from "./Institution";

@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  table_name!: string;

  @Column()
  operation!: string; // INSERT, UPDATE, DELETE

  @Column()
  record_id!: string;

  @Column("text", { nullable: true })
  old_values!: string; // JSON string

  @Column("text", { nullable: true })
  new_values!: string; // JSON string

  @Column()
  ip_address!: string;

  @Column()
  user_agent!: string;

  @Column("text", { nullable: true })
  description!: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  user!: User;

  @ManyToOne(() => Institution, { nullable: true })
  @JoinColumn({ name: "institution_id" })
  institution!: Institution;
}
