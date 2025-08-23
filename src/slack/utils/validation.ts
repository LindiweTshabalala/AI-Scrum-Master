/**
 * Input validation utilities
 */

import { GetUsersOptions } from "../types/slack";

/**
 * Validates the bot token format and presence
 */
export function validateBotToken(botToken: string | undefined): void {
  if (!botToken) {
    throw new Error("Bot token is required");
  }

  if (typeof botToken !== "string") {
    throw new Error("Bot token must be a string");
  }

  if (!botToken.startsWith("xoxb-")) {
    throw new Error(
      'Invalid bot token format. Bot tokens must start with "xoxb-"'
    );
  }

  if (botToken.length < 50) {
    throw new Error("Bot token appears to be invalid (too short)");
  }
}

/**
 * Validates and normalizes the options object
 */
export function validateAndNormalizeOptions(
  options: GetUsersOptions = {}
): Required<GetUsersOptions> {
  const opts: Required<GetUsersOptions> = {
    includeDeleted: false,
    includeBots: false,
    includeAppUsers: false,
    maxRetries: 3,
    retryDelayMs: 1000,
    timeoutMs: 30000,
    ...options,
  };

  if (opts.maxRetries < 0 || opts.maxRetries > 10) {
    throw new Error("maxRetries must be between 0 and 10");
  }

  if (opts.timeoutMs < 1000 || opts.timeoutMs > 300000) {
    throw new Error(
      "timeoutMs must be between 1000ms and 300000ms (5 minutes)"
    );
  }

  if (opts.retryDelayMs < 100 || opts.retryDelayMs > 10000) {
    throw new Error("retryDelayMs must be between 100ms and 10000ms");
  }

  return opts;
}
