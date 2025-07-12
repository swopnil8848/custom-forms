// /src/dto/formFieldDto/formFieldDto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsNumber,
  MinLength,
  MaxLength,
} from "class-validator";
import { FieldType } from "../../entities/FormField";

export class createFormFieldDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  label!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fieldName!: string;

  @IsEnum(FieldType)
  fieldType!: FieldType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsString()
  helpText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsNumber()
  orderNumber?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class updateFormFieldDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fieldName?: string;

  @IsOptional()
  @IsEnum(FieldType)
  fieldType?: FieldType;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsString()
  helpText?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsNumber()
  orderNumber?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
