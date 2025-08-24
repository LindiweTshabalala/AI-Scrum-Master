import { Request, Response } from "express";
import { config } from "config/env";
import { app, getUserIdByEmail, slackChannelService } from "../../slack/index";
import bolt from "@slack/bolt";
const { ExpressReceiver } = bolt;
import type {
  SlackMessage,
  TriggerExtractionRequestBody,
} from "slack/types/slack";

// 1. Create an ExpressReceiver
export const receiver = new ExpressReceiver({
  signingSecret: config.signing_secret,
});

receiver.app.post(
  "/trigger-extraction",
  async (req: Request<{}, {}, TriggerExtractionRequestBody>, res: Response) => {
    const { channelName, startDate, endDate, userEmail } = req.body;
    if (!channelName || !startDate || !endDate || !userEmail) {
      return res
        .status(400)
        .send(
          "Missing required parameters: channelName, startDate, endDate, userEmail"
        );
    }

    res
      .status(200)
      .send(
        `Accepted. Looking up IDs for channel #${channelName} and user ${userEmail}.`
      );

    // --- Perform the lookups ---
    const userId = await getUserIdByEmail(config.ai_migo_token, userEmail);
    const channelId = await slackChannelService.findChannelIdByName(
      channelName
    );

    if (!userId) {
      console.error(`Could not find a user with the email: ${userEmail}`);
      return;
    }
    if (!channelId) {
      await app.client.chat.postMessage({
        channel: userId,
        text: `Sorry, I couldn't find a public channel named #${channelName}. Please check the name and try again.`,
      });
      return;
    }

    // --- Run the extraction logic (same as before, but with the found IDs) ---
    try {
      const oldestTimestamp = new Date(startDate).getTime() / 1000;
      const latestTimestamp =
        new Date(endDate).setHours(23, 59, 59, 999) / 1000;

      let allMessages: SlackMessage[] = [];
      let hasMore: boolean = true;
      let cursor: string | undefined;

      while (hasMore) {
        const result = await app.client.conversations.history({
          channel: channelId,
          oldest: oldestTimestamp.toString(),
          latest: latestTimestamp.toString(),
          cursor: cursor,
          limit: 200,
        });

        allMessages = allMessages.concat(result.messages as SlackMessage[]);
        hasMore = result.has_more as boolean;
        cursor = result.response_metadata?.next_cursor;
      }

      if (allMessages.length === 0) {
        await app.client.chat.postMessage({
          channel: userId,
          text: `No messages found in channel #${channelName} for the specified date range.`,
        });
        return;
      }

      // Keep only actual user messages (no system subtypes like joins, integrations, etc.)
      const userMessages = (allMessages as any[]).filter(
        (m) => m && m.type === "message" && !m.subtype && m.user && m.text
      ) as SlackMessage[];

      if (userMessages.length === 0) {
        await app.client.chat.postMessage({
          channel: userId,
          text: `No user messages found in channel #${channelName} for the specified date range.`,
        });
        return;
      }

      // Resolve each unique user ID to an email (fallback to the ID if resolution fails)
      const uniqueUserIds = Array.from(
        new Set(userMessages.map((m) => m.user!).filter(Boolean))
      );

      const userIdToEmail: Record<string, string> = {};
      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          try {
            const info = await app.client.users.info({ user: uid });
            const email = info.user?.profile?.email;
            userIdToEmail[uid] = email ?? uid;
          } catch (err) {
            // If we can't fetch the email, fall back to the raw user ID
            userIdToEmail[uid] = uid;
          }
        })
      );

      const formattedText = userMessages
        .reverse()
        .map((msg) => {
          const when = new Date(Number(msg.ts) * 1000).toLocaleString("en-ZA");
          const who = msg.user
            ? userIdToEmail[msg.user] ?? msg.user
            : "(unknown)";
          return `${when} - ${who}: ${msg.text}`;
        })
        .join("\n");

      // Ensure we have a DM channel id (starts with 'D') for the user so the
      // files.uploadV2 call receives a valid channel_id value.
      const dmOpen = await app.client.conversations.open({ users: userId });
      const dmChannelId = dmOpen.channel?.id;

      if (!dmChannelId) {
        await app.client.chat.postMessage({
          channel: userId,
          text: `Sorry, I couldn't open a DM with you to send the chat export.`,
        });
        return;
      }

      await app.client.files.uploadV2({
        channel_id: dmChannelId,
        content: formattedText,
        filename: `chat-export-${channelName}-${startDate}-to-${endDate}.txt`,
        initial_comment: `Here is the chat history you requested for channel #${channelName}.`,
      });
    } catch (error: any) {
      console.error("Extraction failed:", error);
      await app.client.chat.postMessage({
        channel: userId,
        text: `Sorry, an error occurred while trying to extract the chat history for #${channelName}. Error: ${error.message}`,
      });
    }
  }
);
