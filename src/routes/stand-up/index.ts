import { getActiveUserIds } from "../../slack";
import bolt from "@slack/bolt";
import { config } from "../../config/env";

const { App, ExpressReceiver } = bolt;

export const receiver = new ExpressReceiver({
  signingSecret: config.signing_secret,
});

const app = new App({
  receiver,
  token: config.ai_migo_token,
});

export const STANDUP_MESSAGE =
  "Hey 👋 Time for daily stand-up! Please share:\n" +
  "1️⃣ What did you accomplish yesterday?\n" +
  "2️⃣ What are you working on today?\n" +
  "3️⃣ Any blockers or challenges?";

async function sendStandupRequest(userId: string): Promise<void> {
  try {
    await app.client.chat.postMessage({
      channel: userId,
      text: STANDUP_MESSAGE,
      as_user: true,
    });
  } catch (error) {
    console.error(`Failed to send standup request to user ${userId}:`, error);
  }
}

export async function sendStandupReport(
  channel: string,
  message: string
): Promise<void> {
  try {
    await app.client.chat.postMessage({
      channel: channel,
      text: message,
      as_user: true,
    });
  } catch (error) {
    console.error(`Failed to send standup request to user ${channel}:`, error);
  }
}

export async function sendStandupRequests(): Promise<void> {
  const activeUserIds = await getActiveUserIds();

  for (const userId of activeUserIds) {
    await sendStandupRequest(userId);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
}
