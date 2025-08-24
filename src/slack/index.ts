import bolt from "@slack/bolt";
const { App } = bolt;
export { getActiveUserIds, getUserByEmail } from "./services/slackUserService";

import { getUserByEmail } from "./services/slackUserService";
import { config } from "../config/env";
import { SlackChannelService } from "./services/slackChannelService";

/** Resolves a user ID by email using the bolt app client. */
export async function getUserIdByEmail(email: string): Promise<string | null> {
  return getUserByEmail(email);
}

export const app = new App({
  token: config.ai_migo_token,
  appToken: config.slack_app_token,
  socketMode: true,
});

export const slackChannelService = new SlackChannelService(app);
