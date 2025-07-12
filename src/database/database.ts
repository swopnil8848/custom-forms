// /src/database.ts
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "Maharj@n123",
  database: process.env.DB_NAME || "custom-form",
  synchronize: true,
  logging: false,
  entities: [__dirname + "/../entities/**/*.ts"],
  migrations: ["./src/migrations/**/*.ts"],
});

// Function to initialize the database
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit on failure
  }
};
