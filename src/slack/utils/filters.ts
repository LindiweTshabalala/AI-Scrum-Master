/**
 * User filtering utilities
 */

import { SlackUser, GetUsersOptions, UserStats } from "../types/slack";

/**
 * Filters users based on provided options
 */
export function filterUsers(
  users: SlackUser[],
  options: GetUsersOptions
): SlackUser[] {
  return users.filter((user) => {
    // Filter deleted users
    if (!options.includeDeleted && user.deleted) {
      return false;
    }

    // Filter bots
    if (!options.includeBots && user.is_bot) {
      return false;
    }

    // Filter app users (like Slackbot)
    if (
      !options.includeAppUsers &&
      (user.id.includes("SLACKBOT") || user.is_app_user)
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Generates statistics about the user collection
 */
export function generateUserStats(users: SlackUser[]): UserStats {
  return {
    activeUsers: users.filter((u) => !u.deleted && !u.is_bot && !u.is_app_user)
      .length,
    deletedUsers: users.filter((u) => u.deleted).length,
    botUsers: users.filter((u) => u.is_bot).length,
    appUsers: users.filter((u) => u.is_app_user).length,
  };
}
