/**
 * Main service class for Slack user operations
 */

import {
  SlackUser,
  SlackUsersResponse,
  GetUsersOptions,
  GetUsersResult,
} from "../types/slack";
import { SlackApiError } from "../errors/slackApiError";
import {
  validateBotToken,
  validateAndNormalizeOptions,
} from "../utils/validation";
import { filterUsers, generateUserStats } from "../utils/filters";
import { WebClient } from "@slack/web-api";
import { app } from "../index";

export class SlackUserService {
  private readonly client: WebClient;
  private readonly maxPages: number = 1000; // Safety limit

  constructor(botToken: string) {
    validateBotToken(botToken);
    this.client = new WebClient(botToken);
  }

  /**
   * Fetches a single page of users from Slack API
   */
  private async fetchUsersPage(
    cursor?: string,
    timeoutMs: number = 30000
  ): Promise<SlackUsersResponse> {
    try {
      const result = await this.client.users.list({
        limit: 200, // Maximum allowed by Slack
        cursor: cursor,
      });

      return result as SlackUsersResponse;
    } catch (error: any) {
      const isRetryable = SlackApiError.isRetryableError(
        error.code || error.data?.error || "",
        error.code === "slack_webapi_platform_error" ? 500 : undefined
      );

      throw new SlackApiError(
        error.message || "Unknown Slack API error",
        error.code === "slack_webapi_platform_error" ? 500 : undefined,
        isRetryable
      );
    }
  }

  /**
   * Retrieves all users with pagination support
   */
  private async fetchAllUsers(
    options: Required<GetUsersOptions>
  ): Promise<SlackUser[]> {
    let allUsers: SlackUser[] = [];
    let cursor: string | undefined;
    let pageCount = 0;

    console.log("Starting user retrieval process...");

    do {
      pageCount++;
      console.log(`Fetching page ${pageCount}...`);

      if (pageCount > this.maxPages) {
        throw new Error(`Maximum page limit (${this.maxPages}) exceeded`);
      }

      // Fetch page with built-in retry logic from WebClient
      const pageData = await this.fetchUsersPage(cursor, options.timeoutMs);

      if (!pageData.members || !Array.isArray(pageData.members)) {
        throw new Error(
          "Invalid response format: missing or invalid members array"
        );
      }

      allUsers.push(...pageData.members);
      cursor = pageData.response_metadata?.next_cursor;

      console.log(
        `Page ${pageCount} fetched: ${pageData.members.length} users`
      );

      // Built-in rate limiting handled by WebClient, but add a small delay for safety
      if (cursor) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } while (cursor);

    return allUsers;
  }

  /**
   * Main method to retrieve all user IDs
   */
  public async getAllUserIds(
    options: GetUsersOptions = {}
  ): Promise<GetUsersResult> {
    try {
      const opts = validateAndNormalizeOptions(options);
      const startTime = Date.now();

      // Fetch all users
      const allUsers = await this.fetchAllUsers(opts);

      // Filter users based on options
      const filteredUsers = filterUsers(allUsers, opts);
      const userIds = filteredUsers.map((user) => user.id);

      // Generate statistics
      const stats = generateUserStats(allUsers);

      const duration = Date.now() - startTime;
      console.log(
        `✅ Successfully retrieved ${userIds.length} user IDs in ${duration}ms`
      );
      console.log(
        `📊 Stats: ${stats.activeUsers} active, ${stats.deletedUsers} deleted, ${stats.botUsers} bots, ${stats.appUsers} app users`
      );

      return {
        success: true,
        userIds,
        totalUsers: allUsers.length,
        details: stats,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("❌ Failed to retrieve user IDs:", errorMessage);

      return {
        success: false,
        userIds: [],
        totalUsers: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Method to get only active user IDs
   */
  public async getActiveUserIds(): Promise<string[]> {
    const result = await this.getAllUserIds({
      includeDeleted: false,
      includeBots: false,
      includeAppUsers: false,
    });

    return result.userIds;
  }

  /**
   * Method to get user by email
   */
  public async findUserIdByEmail(email: string):Promise<string | null | undefined>  {
  try {
    const result = await app.client.users.lookupByEmail({ email });
    return result.user?.id;
  } catch (error) {
    console.error(`Failed to find user by email ${email}:`, error);
    return null;
  }
}

}
