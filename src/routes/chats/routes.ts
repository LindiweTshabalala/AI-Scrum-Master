import { Request, Response } from "express";
import { config } from "config/env";
import { getUserIdByEmail, slackChannelService } from "../../slack/index";
import { chatExtractionService } from "../../slack/services/chatExtractionService";
import bolt from "@slack/bolt";
const { ExpressReceiver } = bolt;
import type { TriggerExtractionRequestBody } from "slack/types/slack";

// 1. Create an ExpressReceiver
export const receiver = new ExpressReceiver({
  signingSecret: config.signing_secret,
});

receiver.app.post(
  "/analyze",
  async (req: Request<{}, {}, TriggerExtractionRequestBody>, res: Response) => {
    const {
      channelName,
      startDate,
      endDate,
      reviewUserEmail,
      userToEmail,
      purpose,
      outputChannelName, // New parameter for sprint-retro output channel
    } = req.body;

    // Validate required parameters
    if (!channelName || !startDate || !endDate || !userToEmail) {
      return res
        .status(400)
        .send(
          "Missing required parameters: channelName, startDate, endDate, userToEmail"
        );
    }

    // For sprint-retro, outputChannelName is required
    if (purpose === "sprint-retro" && !outputChannelName) {
      return res
        .status(400)
        .send(
          "Missing required parameter: outputChannelName is required for sprint-retro analysis"
        );
    }

    // Look up IDs first
    const userId = await getUserIdByEmail(config.ai_migo_token, userToEmail);
    const channelId = await slackChannelService.findChannelIdByName(
      channelName
    );

    // Look up output channel ID for sprint-retro
    let outputChannelId: string | undefined;
    if (purpose === "sprint-retro" && outputChannelName) {
      const foundOutputChannelId =
        await slackChannelService.findChannelIdByName(outputChannelName);
      if (!foundOutputChannelId) {
        return res
          .status(404)
          .send(`Could not find output channel named #${outputChannelName}`);
      }
      outputChannelId = foundOutputChannelId;
    }

    // Validate lookups
    if (!userId || !channelId) {
      const errorMessage = !userId
        ? `Could not find a user with the email: ${userToEmail}`
        : `Could not find a public channel named #${channelName}`;

      console.error(errorMessage);
      return res.status(404).send(errorMessage);
    }

    // Trigger the extraction and analysis
    const result = await chatExtractionService.extractAndAnalyzeChat(
      channelId,
      userId,
      channelName,
      startDate,
      endDate,
      reviewUserEmail,
      purpose,
      outputChannelId // Pass the output channel ID
    );

    if (!result.success) {
      return res
        .status(500)
        .send(result.error || "An error occurred during extraction");
    }

    return res.status(200).send("Analysis completed successfully");
  }
);
