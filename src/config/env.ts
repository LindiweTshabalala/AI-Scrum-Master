import dotenv from "dotenv";
dotenv.config();

interface Config {
  port: number;
  environment: string;
  ai_migo_token: string;
  slack_app_token: string;
  signing_secret: string;
  ai_model: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || "3000", 10),
  environment: process.env.NODE_ENV || "development",
  ai_migo_token: process.env.AI_MIGO_TOKEN ?? "",
  slack_app_token: process.env.SLACK_APP_TOKEN ?? "",
  signing_secret: process.env.SIGNING_SECRET ?? "",
  ai_model: process.env.AI_MODEL || "gemini-2.0-flash-001",
};
