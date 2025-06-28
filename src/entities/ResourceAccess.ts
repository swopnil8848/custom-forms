// src/entities/ResourceAccess.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Resource } from "./Resource";
import { User } from "./User";

@Entity("resource_access")
export class ResourceAccess {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  accessed_at!: Date;

  @Column()
  access_type!: string;

  @Column()
  ip_address!: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @ManyToOne(() => Resource, (resource) => resource.access_logs)
  @JoinColumn({ name: "resource_id" })
  resource!: Resource;

  @ManyToOne(() => User)
  @JoinColumn()
  user!: User;
}
