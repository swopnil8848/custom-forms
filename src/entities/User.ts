import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from "typeorm";


export enum UserRole {
  ADMIN = "admin",
  OFFICER = "officer",
  TEACHER = "teacher",
  STUDENT = "student",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column({ nullable: true })
  middleName!: string;

  @Column({ nullable: true })
  lastName!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role!: UserRole;

  @Column({
    type: "boolean",
    default: false,
  })
  isVerified!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", nullable: true })
  passwordChangedAt?: Date;

  @Column({
    type: String,
    nullable: true,
  })
  emailVerificationToken!: String | null;

  @Column({
    type: String,
    nullable: true,
  })
  passwordResetToken!: String | null;

  // Helper methods
  get full_name(): string {
    return `${this.firstName} ${this.middleName} ${this.lastName}`;
  }
}
