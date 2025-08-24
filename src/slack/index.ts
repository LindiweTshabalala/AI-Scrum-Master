import bolt from "@slack/bolt";
const { App } = bolt;
export { getActiveUserIds, getUserByEmail } from "./services/slackUserService";

import { getUserByEmail } from "./services/slackUserService";
import { config } from "../config/env";
import { SlackChannelService } from "./services/slackChannelService";

export async function getUserIdByEmail(
  botToken: string,
  email: string
): Promise<string | null> {
  const client = new (await import("@slack/web-api")).WebClient(botToken);
  return getUserByEmail(client, email);
}

export const app = new App({
  token: config.ai_migo_token,
  appToken: config.slack_app_token,
  socketMode: true,
});

export const slackChannelService = new SlackChannelService(app);
