import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import { initializeDatabase } from "./database/database";
import http from "http";
import AppError from "./utils/AppError";
import { errorHandler } from "./controller/errorController";
import formRoute from "./route/formRoutes";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import cors from "cors";
import path from "path";
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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoute);
app.use("/api/form", formRoute);

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
