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

/**
 * Get only active user IDs
 */
export async function getActiveUserIds(botToken: string): Promise<string[]> {
  const service = new SlackUserService(botToken);
  return service.getActiveUserIds();
}
