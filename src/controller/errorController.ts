// types/errorTypes.ts
export type ErrorTypes =
  | ValidationError[]
  | Record<string, string[]>
  | Error
  | unknown;

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  error?: ErrorTypes;
  code?: string;
}

import jwt from "jsonwebtoken";
// utils/errorHandler.ts
import { Request, Response, NextFunction } from "express";
import { ValidationError } from "class-validator";
import AppError from "../utils/AppError";
import * as fs from "fs";

class ErrorHandler {
  // Priority order for validation constraints
  private validationPriorities = [
    "isNotEmpty",
    "isEmail",
    "minLength",
    "matches",
    "isString",
    "isNumber",
    "min",
    "max",
  ];

  private getHighestPriorityError(constraints: Record<string, string>): string {
    const priorityConstraint = this.validationPriorities.find(
      (priority) => constraints[priority]
    );

    return priorityConstraint
      ? constraints[priorityConstraint]
      : Object.values(constraints)[0];
  }

  private formatValidationErrors(
    errors: ValidationError[]
  ): Record<string, string> {
    const formattedErrors: Record<string, string> = {};

    errors.forEach((error) => {
      if (error.constraints) {
        const priorityError = this.getHighestPriorityError(error.constraints);
        formattedErrors[error.property] = priorityError;
      }

      if (error.children?.length) {
        const childErrors = this.formatValidationErrors(error.children);
        Object.assign(formattedErrors, childErrors);
      }
    });

    return formattedErrors;
  }

  private formatError(err: CustomError): AppError {
    console.log(err);
    console.log("type of error:: ", typeof err);

    if (err.name === "JsonWebTokenError") {
      return new AppError("Invalid token. Please log in again!", 401);
    }

    if (err.name === "TokenExpiredError") {
      return new AppError("Your token has expired! Please log in again.", 401);
    }

    // Handle validation errors from class-validator
    if (Array.isArray(err.error) && err.error[0] instanceof ValidationError) {
      const formattedErrors = this.formatValidationErrors(err.error);
      return new AppError("Validation failed", 400, formattedErrors);
    }

    // Handle other types of errors
    return new AppError(
      err.message || "Something went wrong",
      err.statusCode || 500,
      err.error
    );
  }

  private sendErrorDev(error: AppError, req: Request, res: Response): void {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      error: error.error,
      stack: error.stack,
    });
  }

  private sendErrorProd(error: AppError, req: Request, res: Response): any {
    // For validation errors
    if (error.statusCode === 400 && error.error) {
      return res.status(error.statusCode).json({
        status: "fail",
        message: error.error, // This will now be a simplified error object
      });
    }

    console.log("error.status:: ", error.status);
    // For other errors
    return res.status(error.statusCode).json({
      status: error.status || 400,
      message: error.isOperational ? error.message : "Something went wrong",
    });
  }

  public handleError = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    // console.log("error.name:: ",typeof err.error)
    // console.log("error.instance of ",err.error instanceof AppError)
    // Delete uploaded files if req.files exists

    if (req.file?.path) {
      const filePath = req.file.path;

      try {
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting file:", filePath, unlinkErr);
          } else {
            console.log("Deleted file:", filePath);
          }
        });
      } catch (fileError) {
        console.error("Error while deleting file:", fileError);
      }
    }

    if (req.files) {
      try {
        const files = Array.isArray(req.files)
          ? req.files
          : Object.values(req.files).flat();
        files.forEach((file) => {
          if (file.path) {
            fs.unlink(file.path, (unlinkErr) => {
              if (unlinkErr)
                console.error("Error deleting file:", file.path, unlinkErr);
              else console.log("Deleted file:", file.path);
            });
          }
        });
      } catch (fileError) {
        console.error("Error while deleting files:", fileError);
      }
    }

    // if(typeof err.error == string)
    // console.log("error in handler:: ",err)
    const formattedError = this.formatError(err);
    // console.log("errorHandler is being called",formattedError)
    console.log("handle error is being called::");

    if (process.env.NODE_ENV === "development") {
      console.log("development is being called::>> ");
      this.sendErrorDev(formattedError, req, res);
    } else {
      console.log("production error is being called::>> ");
      this.sendErrorProd(formattedError, req, res);
    }
  };
}

export const errorHandler = new ErrorHandler().handleError;
