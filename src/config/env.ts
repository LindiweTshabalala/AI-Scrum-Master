import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

interface Config {
  port: number;
  environment: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  environment: process.env.NODE_ENV || "development",
};
