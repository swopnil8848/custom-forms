import { IsArray, ValidateNested, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";

export class SubmissionDataDto {
  @IsNumber()
  fieldId!: number;

  @IsString()
  value!: string;
}

export class createFormSubmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionDataDto)
  submissionData!: SubmissionDataDto[];
}
