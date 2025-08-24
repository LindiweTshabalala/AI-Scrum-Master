import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import routes from "./routes";
import { app as slackApp } from "./slack/index";
import { gemini } from "slack/gemini";
import { STANDUP_MESSAGE } from "routes/stand-up";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "healthy" });
});

app.use(routes);

const PORT = config.port || 3000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await slackApp.start();
  console.log("⚡️ Bolt app started");
});

type SlackMessageEvent = {
  user: string;
  type: "message";
  ts: string;
  client_msg_id: string;
  text: string;
  team: string;
  blocks: {
    type: "rich_text";
    block_id: string;
    elements: unknown[]; // can refine further if you know the element structure
  }[];
  channel: string;
  event_ts: string;
  channel_type: "im" | "channel" | "group" | "mpim";
};

// LISTENER for EVERY message the bot receives.
slackApp.message(async ({ message, say }) => {
  // if (
  //   message.subtype === "bot_message" ||
  //   message.subtype === "message_deleted"
  // ) {
  //   return;
  // }
  const userMessage = message as SlackMessageEvent


  console.log("Received a message:", message);
  await gemini(STANDUP_MESSAGE, userMessage.text);

  // Log the full message object to the console to see its structure.
});
