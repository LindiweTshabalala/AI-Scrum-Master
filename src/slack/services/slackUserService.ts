import { WebClient } from "@slack/web-api";

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
