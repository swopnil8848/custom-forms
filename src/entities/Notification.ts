// src/entities/Notification.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export enum NotificationType {
  ASSIGNMENT = "assignment",
  GRADE = "grade",
  ANNOUNCEMENT = "announcement",
  REMINDER = "reminder",
  SYSTEM = "system",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column("text")
  message!: string;

  @Column({
    type: "enum",
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type!: NotificationType;

  @Column({
    type: "enum",
    enum: NotificationPriority,
    default: NotificationPriority.MEDIUM,
  })
  priority!: NotificationPriority;

  @Column({ default: false })
  is_read!: boolean;

  @Column({ nullable: true })
  read_at!: Date;

  @Column("text", { nullable: true })
  notification_data!: string; // JSON data

  @Column({ nullable: true })
  scheduled_for!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn()
  user!: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "triggered_by" })
  triggered_by_user!: User;
}
