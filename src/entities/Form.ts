import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { FormField } from "./FormField";

@Entity()
export class Form {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  isPublished!: boolean;

  @Column({ type: "timestamp", nullable: true })
  publishedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  expiresAt?: Date;

  @Column()
  createdBy!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: "createdBy" })
  creator!: User;

  @OneToMany(() => FormField, (formField) => formField.form, {
    cascade: true,
    eager: true,
  })
  fields!: FormField[];

  /** PARENT-CHILD SELF-REFERENCE **/
  @ManyToOne(() => Form, (form) => form.children, { nullable: true })
  @JoinColumn({ name: "parentId" })
  parent?: Form | null;

  @OneToMany(() => Form, (form) => form.parent)
  children!: Form[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
