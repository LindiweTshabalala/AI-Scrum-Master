import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import routes from "./routes";
import { app as slackApp } from "./slack/index";
import { STANDUP_MESSAGE } from "routes/stand-up";
import { AppDataSource } from "./database/config";
import { StandupService } from "./services/standupService";
import { GeminiAnalysis } from "./types/gemini";

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log("Database connection initialized");
  })
  .catch((error: any) => {
    console.error("Error initializing database:", error);
  });

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

const userEmailCache = new Map<string, string>();
// LISTENER for EVERY message the bot receives.
slackApp.message(async ({ message, say }) => {
  const userMessage = message as SlackMessageEvent;
  const standupService = new StandupService();

  console.log("Received a message:", message);
  
  try {
    const analysis: GeminiAnalysis = await gemini(STANDUP_MESSAGE, userMessage.text, userMessage.user);

    await standupService.saveStandupResponse({
      userId: userMessage.user,
      username: userMessage.user, // You might want to fetch actual username
      teamId: userMessage.team,
      response: {
        yesterday: "", // Add parsing logic
        today: "", // Add parsing logic
        blockers: "", // Add parsing logic
      },
      sentiment: analysis.sentiment,
      productivity: analysis.productivity,
      aiSummary: analysis.summary,
      metrics: analysis.metrics,
    });
  } catch (error) {
    console.error("Error processing standup:", error);
  }

  if (
    message.subtype === "bot_message" ||
    message.subtype === "message_deleted"
  ) {
    return;
  }

  const userId = (message as any).user;
  if (userId) {
    let email = userEmailCache.get(userId);
    if (!email) {
      try {
        const resp = await slackApp.client.users.info({ user: userId });
        email = resp.user?.profile?.email;
        if (email) userEmailCache.set(userId, email);
      } catch (err) {
        console.error("Failed to resolve user email for", userId, err);
        // leave email undefined so we can fallback
      }
    }

    const author = email ?? userId; // prefer email, fallback to id
    console.log(`Received a message from ${author}:`, message);

    const userMessage = message as SlackMessageEvent;

    await gemini(STANDUP_MESSAGE, userMessage.text, author);
  }
});

export async function gemini(prompt: string, text: string, author: any): Promise<GeminiAnalysis> {
  const analysis: GeminiAnalysis = {
        sentiment: 0,
        productivity: 0,
        summary: "",
        metrics: {
            taskCompletion: 0,
            blockersResolved: false,
            responseTime: 0,
            detailLevel: 0
        }
    };
    
    return analysis;
}
