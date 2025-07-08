import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { initializeDatabase } from "./database/database";
import http from "http";
import AppError from "./utils/AppError";
import { errorHandler } from "./controller/errorController";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import cors from "cors";
import path from "path";
import fs from "fs";
import { protect } from "./middleware/auth";
import authRoute from "./route/authRoute";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: true, // Allow requests from this origin
    credentials: true, // Allow cookies to be sent with the request
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization,x-auth-token",
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

app.use("/logo", express.static(path.join(__dirname, "logo")));
app.use("/address", express.static(path.join(__dirname, "address")));

app.get(
  "/uploads/:folder/:filename",
  protect,
  async (req: Request, res: Response): Promise<any> => {
    const { folder, filename } = req.params;

    if (folder.includes("..") || filename.includes("..")) {
      return res.status(400).json({ message: "Invalid path" });
    }

    const filePath = path.join(__dirname, "uploads", folder, filename);

    const fileParts = filename.split("-");
    const lastPart = fileParts[fileParts.length - 1]; // "1.png"
    const fileUserId = lastPart.split(".")[0];

    const isAdmin = req.user?.role === "admin";
    const isOwner = req.user?.id === Number(fileUserId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.sendFile(filePath);
  }
);

app.use("/api/auth", authRoute);

app.use("/health", (req, res) => {
  res.status(200).json({
    status: 200,
    message: "it works",
  });
});

app.all(/.*/, (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server`, 400));
});

// Start server and initialize DB
const PORT = process.env.PORT || 3000;
const startApp = async () => {
  await initializeDatabase();

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`PORT listening to ${port}`);
  });
};

app.use(errorHandler);

startApp();
