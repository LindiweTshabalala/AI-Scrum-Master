import bolt from "@slack/bolt";
const { App } = bolt;
/**
 * Main entry point - Public API exports
 */

// Export main service class
export { SlackUserService } from "./services/slackUserService";

// Export types for consumers
export type {
  SlackUser,
  GetUsersOptions,
  GetUsersResult,
  UserStats,
} from "./types/slack.js";

// Export error class
export { SlackApiError } from "./errors/slackApiError";

import { SlackUserService } from "./services/slackUserService";
import { config } from "config/env";

/**
 * Get only active user IDs
 */
export async function getActiveUserIds(botToken: string): Promise<string[]> {
  const service = new SlackUserService(botToken);
  return service.getActiveUserIds();
}

export const app = new App({
  token: config.ai_migo_token,
  appToken: config.slack_app_token,
  socketMode: true,
});
