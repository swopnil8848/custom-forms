import { ValidationError } from "class-validator";

export type ErrorTypes =
  | ValidationError[]
  | Record<string, string[]>
  | Error
  | unknown;

export interface IAppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  error?: ErrorTypes;
}

export default class AppError extends Error implements IAppError {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public error: ErrorTypes;

  constructor(message: string, statusCode: number = 400, error?: ErrorTypes) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.error = error;

    Error.captureStackTrace(this, this.constructor);
  }
}
