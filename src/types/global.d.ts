import { Request } from "express";
import { User } from "../models/User"; // Adjust path if necessary
import { Multer } from "multer"; // Ensure multer is installed

declare global {
  namespace Express {
    interface Request {
      user?: User | null;
      file?: Multer.File;
    }
  }
}

export {};
