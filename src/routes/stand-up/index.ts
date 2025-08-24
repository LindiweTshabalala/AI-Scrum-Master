import { getActiveUserIds } from '../../slack';
import { WebClient } from '@slack/web-api';

export const STANDUP_MESSAGE = "Hey 👋 Time for daily stand-up! Please share:\n" +
    "1️⃣ What did you accomplish yesterday?\n" +
    "2️⃣ What are you working on today?\n" +
    "3️⃣ Any blockers or challenges?";

/**
 * Sends a stand-up request to a single user
 */
async function sendStandupRequest(client: WebClient, userId: string): Promise<void> {
    try {
        await client.chat.postMessage({
            channel: userId,
            text: STANDUP_MESSAGE,
            as_user: true
        });
    } catch (error) {
        console.error(`Failed to send standup request to user ${userId}:`, error);
    }
}

export async function sendStandupReport(client: WebClient, channel: string, message: string): Promise<void> {
    try {
        await client.chat.postMessage({
          channel: channel,
          text: message,
          as_user: true,
        });
    } catch (error) {
        console.error(
          `Failed to send standup request to user ${channel}:`,
          error
        );
    }
}

/**
 * Sends stand-up requests to all active users with a delay between each request
 */
export async function sendStandupRequests(botToken: string): Promise<void> {
    const client = new WebClient(botToken);
    const activeUserIds = await getActiveUserIds(botToken);
    
    for (const userId of activeUserIds) {
        await sendStandupRequest(client, userId);
        // Wait 1.5 seconds before sending the next message to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
}
