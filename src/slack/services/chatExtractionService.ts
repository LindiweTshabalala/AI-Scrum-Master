import { app } from "../index";
import { SlackMessage } from "../types/slack";
import { sprintAnalyzer } from "../../agents/sprintAnalyzer";

export interface ExtractionResult {
  success: boolean;
  error?: string;
}

export class ChatExtractionService {
  async extractAndAnalyzeChat(
    channelId: string,
    userId: string,
    channelName: string,
    startDate: string,
    endDate: string,
    analyzeUserEmail?: string,
    purpose?: string
  ): Promise<ExtractionResult> {
    try {
      const oldestTimestamp = new Date(startDate).getTime() / 1000;
      const latestTimestamp =
        new Date(endDate).setHours(23, 59, 59, 999) / 1000;

      let allMessages: SlackMessage[] = [];
      let hasMore: boolean = true;
      let cursor: string | undefined;

      // Fetch all messages
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
        return { success: true };
      }

      // Filter for user messages only
      const userMessages = (allMessages as any[]).filter(
        (m) => m && m.type === "message" && !m.subtype && m.user && m.text
      ) as SlackMessage[];

      if (userMessages.length === 0) {
        await app.client.chat.postMessage({
          channel: userId,
          text: `No user messages found in channel #${channelName} for the specified date range.`,
        });
        return { success: true };
      }

      // Resolve user IDs to emails
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
            userIdToEmail[uid] = uid;
          }
        })
      );

      // Format messages
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

      // Generate analysis if requested
      let analysis = "";
      if (purpose === "sprint-retro") {
        analysis = await sprintAnalyzer(
          formattedText,
          userIdToEmail[userId] || userId
        );
      }

      // Send results via DM
      const dmOpen = await app.client.conversations.open({ users: userId });
      const dmChannelId = dmOpen.channel?.id;

      if (!dmChannelId) {
        await app.client.chat.postMessage({
          channel: userId,
          text: `Sorry, I couldn't open a DM with you to send the chat export.`,
        });
        return { success: false, error: "Could not open DM channel" };
      }

      // Upload analysis if available
      if (analysis) {
        await app.client.files.uploadV2({
          channel_id: dmChannelId,
          content: analysis,
          filename: `sprint-retrospective-${startDate}-to-${endDate}.txt`,
          initial_comment: "Sprint Retrospective Analysis",
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error("Extraction failed:", error);
      await app.client.chat.postMessage({
        channel: userId,
        text: `Sorry, an error occurred while trying to extract the chat history for #${channelName}. Error: ${error.message}`,
      });
      return { success: false, error: error.message };
    }
  }
}

export const chatExtractionService = new ChatExtractionService();
