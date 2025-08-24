import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

interface Config {
  port: number;
  environment: string;
  ai_migo_token: string;
  slack_app_token: string;
  db: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  environment: process.env.NODE_ENV || "development",
  ai_migo_token: process.env.AI_MIGO_TOKEN ?? "",
  slack_app_token: process.env.SLACK_APP_TOKEN ?? "",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "scrum_master_db"
  }
};
