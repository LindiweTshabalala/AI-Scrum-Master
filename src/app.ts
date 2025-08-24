import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import routes from "./routes";
import { app as slackApp } from "./slack/index";

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

const userEmailCache = new Map<string, string>();
// LISTENER for EVERY message the bot receives.
slackApp.message(async ({ message, say }) => {
  // Ignore messages sent by the bot itself to prevent loops.
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
      console.error('Failed to resolve user email for', userId, err);
      // leave email undefined so we can fallback
    }
  }

  const author = email ?? userId; // prefer email, fallback to id
  console.log('Received a message from:', author, message);
}
});
