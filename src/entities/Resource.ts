// src/entities/Resource.ts
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
import { User } from "./User";
import { Subject } from "./Subject";
import { Group } from "./Group";
import { ResourceAccess } from "./ResourceAccess";

export enum ResourceType {
  DOCUMENT = "document",
  VIDEO = "video",
  AUDIO = "audio",
  IMAGE = "image",
  ARCHIVE = "archive",
  LINK = "link",
}

export enum AccessLevel {
  PUBLIC = "public",
  GROUP = "group",
  RESTRICTED = "restricted",
}

@Entity("resources")
export class Resource {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text", { nullable: true })
  description!: string;

  @Column()
  file_name!: string;

  @Column()
  file_path!: string;

  @Column()
  file_type!: string;

  @Column("bigint")
  file_size!: number;

  @Column({
    type: "enum",
    enum: ResourceType,
    default: ResourceType.DOCUMENT,
  })
  resource_type!: ResourceType;

  @Column({
    type: "enum",
    enum: AccessLevel,
    default: AccessLevel.GROUP,
  })
  access_level!: AccessLevel;

  @Column({ default: 0 })
  download_count!: number;

  @Column({ default: true })
  is_active!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.uploaded_resources)
  @JoinColumn({ name: "uploaded_by" })
  uploaded_by!: User;

  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: "subject_id" })
  subject!: Subject;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: "group_id" })
  group!: Group;

  @OneToMany(() => ResourceAccess, (access) => access.resource)
  access_logs!: ResourceAccess[];
}
