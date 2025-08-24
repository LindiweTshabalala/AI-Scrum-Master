import { app } from "../index";
import { SlackMessage } from "../types/slack";
import { dataAnalyzer, AnalysisType } from "../../agents/dataAnalyzer";

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
    reviewUserEmail?: string,
    purpose?: string,
    outputChannelId?: string
  ): Promise<ExtractionResult> {
    try {
      const oldestTimestamp = new Date(startDate).getTime() / 1000;
      const latestTimestamp =
        new Date(endDate).setHours(23, 59, 59, 999) / 1000;

      let allMessages: SlackMessage[] = [];
      let hasMore: boolean = true;
      let cursor: string | undefined;

      while (hasMore) {
        const historyArgs: any = {
          channel: channelId,
          oldest: oldestTimestamp.toString(),
          latest: latestTimestamp.toString(),
          limit: 200,
        };
        if (cursor) historyArgs.cursor = cursor;
        const result = await app.client.conversations.history(historyArgs);

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

      let analysis: string = "";
      console.log(`Analyzing with purpose: ${purpose}`);
      if (
        purpose === "sprint-retro" ||
        purpose === "user-review" ||
        purpose === "award-nominations"
      ) {
        analysis = await dataAnalyzer({
          chatHistory: formattedText,
          author: userIdToEmail[userId] || userId,
          type: purpose as AnalysisType,
          reviewUserEmail: reviewUserEmail ?? undefined,
          sprintStart: startDate ?? undefined,
          sprintEnd: endDate ?? undefined,
        });
      }

      if (purpose === "sprint-retro" && outputChannelId) {
        if (analysis) {
          await app.client.chat.postMessage({
            channel: outputChannelId,
            text: `Sprint Retrospective Analysis (${startDate} to ${endDate}):\n\`\`\`\n${analysis}\n\`\`\``,
          });
        }
      } else {
        const dmOpen = await app.client.conversations.open({ users: userId });
        const dmChannelId = dmOpen.channel?.id;

        if (!dmChannelId) {
          await app.client.chat.postMessage({
            channel: userId,
            text: `Sorry, I couldn't open a DM with you to send the analysis.`,
          });
          return { success: false, error: "Could not open DM channel" };
        }

        if (analysis) {
          let filename: string;
          let initialComment: string;

          switch (purpose) {
            case "user-review":
              filename = `user-review-${reviewUserEmail}-${startDate}-to-${endDate}.txt`;
              initialComment = `User Review Analysis for ${reviewUserEmail}`;
              break;
            case "award-nominations":
              filename = `award-nominations-${startDate}-to-${endDate}.txt`;
              initialComment = "Company Awards Nomination Analysis";
              break;
            default:
              filename = `sprint-retrospective-${startDate}-to-${endDate}.txt`;
              initialComment = "Sprint Retrospective Analysis";
          }

          await app.client.files.uploadV2({
            channel_id: dmChannelId,
            content: analysis,
            filename,
            initial_comment: initialComment,
          });
        }
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
