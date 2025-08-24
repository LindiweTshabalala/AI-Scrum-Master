import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

interface Config {
  port: number;
  environment: string;
  ai_migo_token: string;
  slack_app_token: string;
  signing_secret: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  environment: process.env.NODE_ENV || "development",
  ai_migo_token: process.env.AI_MIGO_TOKEN ?? "",
  slack_app_token: process.env.SLACK_APP_TOKEN ?? "",
  signing_secret: process.env.SIGNING_SECRET ?? "",
};
