import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import routes from "./routes";
import { app as slackApp } from "./slack";
import { standupAgent } from "./agents/standupAgent";
import { STANDUP_MESSAGE } from "./routes/stand-up";
import isStandup from "./utils/isStandup";

const app = express();

app.use(cors());
app.use(express.json());

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
    elements: unknown[];
  }[];
  channel: string;
  event_ts: string;
  channel_type: "im" | "channel" | "group" | "mpim";
};

const userEmailCache = new Map<string, string>();

/** Resolves and caches a user's email, falling back to user ID if unavailable. */
async function getUserEmail(userId: string): Promise<string> {
  let email = userEmailCache.get(userId);
  if (!email) {
    try {
      const resp = await slackApp.client.users.info({ user: userId });
      email = resp.user?.profile?.email;
      if (email) {
        userEmailCache.set(userId, email);
      }
    } catch (err) {
      console.error("Failed to resolve user email for", userId, err);
    }
  }
  return email ?? userId;
}

/** Global message listener for stand-up trigger messages. */
slackApp.message(async ({ message }) => {
  if (
    message.subtype === "bot_message" ||
    message.subtype === "message_deleted" ||
    message.subtype === "channel_join"
  ) {
    return;
  }

  const userId = (message as any).user;
  if (userId) {
    const author = await getUserEmail(userId);
    console.log(`Received a message from ${author}:`, message);

    const userMessage = message as SlackMessageEvent;

    if (isStandup(userMessage.text)) {
      await standupAgent(STANDUP_MESSAGE, userMessage.text, author);
    }
  }
});
