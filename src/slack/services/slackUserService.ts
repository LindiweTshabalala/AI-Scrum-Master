import { WebClient } from "@slack/web-api";

/** Returns non-bot, non-app, non-deleted user IDs for the workspace. */
export async function getActiveUserIds(botToken: string): Promise<string[]> {
  const client = new WebClient(botToken);

  try {
    const result = await client.users.list({});

    return (
      result.members
        ?.filter((user) => !user.deleted && !user.is_bot && !user.is_app_user)
        .map((user) => user.id)
        .filter((id): id is string => id !== undefined) || []
    );
  } catch (error) {
    console.error("Failed to get active user IDs:", error);
    return [];
  }
}

/** Looks up a user ID by email, returns null if not found. */
export async function getUserByEmail(
  client: WebClient,
  email: string
): Promise<string | null> {
  try {
    const result = await client.users.lookupByEmail({ email });
    return result.user?.id || null;
  } catch (error) {
    console.error(`Failed to find user by email ${email}:`, error);
    return null;
  }
}
