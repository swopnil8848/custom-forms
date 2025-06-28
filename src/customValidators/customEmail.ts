// decorators/CustomEmail.ts
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from "class-validator";
import { AuthService } from "../service/authService";
import AppError from "../utils/AppError";

@ValidatorConstraint({ name: "customEmail", async: true })
export class CustomEmailValidator implements ValidatorConstraintInterface {
  async validate(email: string, args: ValidationArguments) {
    try {
      const user = await AuthService.findByEmail(email);
      return !user; // Returns false if user exists, true if email is unique
    } catch (error) {
      // Log the error if needed
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return "Email is already registered!";
  }
}

// Custom decorator function
export function CustomEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "customEmail",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: CustomEmailValidator,
    });
  };
}

@ValidatorConstraint({ name: "emailPattern", async: false })
export class EmailPatternValidator implements ValidatorConstraintInterface {
  validate(email: string, args: ValidationArguments) {
    // Standard email format validation
    const basicEmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!basicEmailRegex.test(email)) {
      return false;
    }

    // Check for restricted pattern: something+number@gmail.com
    const restrictedPattern = /^[a-zA-Z0-9._%+-]+\+\d+@gmail\.com$/;
    if (restrictedPattern.test(email)) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return "Email format is invalid or uses a restricted pattern";
  }
}

// New decorator for email pattern validation
export function ValidEmailPattern(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "validEmailPattern",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailPatternValidator,
    });
  };
}
