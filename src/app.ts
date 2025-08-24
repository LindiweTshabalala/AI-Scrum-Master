import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import routes from "./routes";
import { app as slackApp } from "./slack/index";
import { standupAgent } from "agents/standupAgent";
import { STANDUP_MESSAGE } from "routes/stand-up";
import isStandup from "utils/isStandup";
import { AppDataSource } from "./database/config";
import "reflect-metadata";

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

// Initialize TypeORM connection
AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");
        
        // Verify the connection
        try {
            await AppDataSource.query('SELECT 1');
            console.log("Database connection verified successfully!");

            // Log connection details (without sensitive info)
            const connectionOptions = AppDataSource.options;
            console.log("Database connection details:", {
                type: connectionOptions.type,
                host: connectionOptions.host,
                port: connectionOptions.port,
                database: connectionOptions.database,
                ssl: connectionOptions.ssl ? "enabled" : "disabled",
                entities: connectionOptions.entities?.length || 0,
            });

            app.listen(PORT, async () => {
                console.log(`🚀 Server running on port ${PORT}`);
                await slackApp.start();
                console.log("⚡️ Bolt app started");
            });
        } catch (error) {
            console.error("Database connection verification failed:", error);
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err);
        process.exit(1);
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
  if (
    message.subtype === "bot_message" ||
    message.subtype === "message_deleted" ||
    message.subtype === "channel_join"
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

    if(isStandup(userMessage.text)){
      await standupAgent(STANDUP_MESSAGE, userMessage.text, author);
    }
  }
});
