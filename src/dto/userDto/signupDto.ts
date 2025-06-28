import { IsEmail, IsNotEmpty, Length, Matches } from "class-validator";
import {
  CustomEmail,
  ValidEmailPattern,
} from "../../customValidators/customEmail";

export class signupUserDto {
  @IsNotEmpty({ message: "Name is required" })
  firstName!: string;

  middleName!: string;

  lastName!: string;

  @IsEmail()
  @IsNotEmpty({ message: "Email is required" })
  @CustomEmail({ message: "Email is already registered" })
  @ValidEmailPattern({
    message: "Email format is invalid or uses a restricted pattern",
  })
  email!: string;

  @Length(8, 20, { message: "Password must be between 8 and 20 characters" })
  @Matches(/(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/, {
    message:
      "Password must contain letters, numbers, and at least one special character",
  })
  @IsNotEmpty({ message: "Password is required" })
  password!: string;
}
