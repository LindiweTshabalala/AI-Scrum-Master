/**
 * Type definitions for Slack API responses and options
 */

export interface SlackUser {
  id: string;
  name: string;
  deleted: boolean;
  is_bot: boolean;
  is_app_user: boolean;
  profile: {
    email?: string;
    display_name?: string;
    real_name?: string;
  };
}

export interface SlackUsersResponse {
  ok: boolean;
  members: SlackUser[];
  cursor?: string;
  response_metadata?: {
    next_cursor?: string;
  };
  error?: string;
}

export interface GetUsersOptions {
  includeDeleted?: boolean;
  includeBots?: boolean;
  includeAppUsers?: boolean;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export interface GetUsersResult {
  success: boolean;
  userIds: string[];
  totalUsers: number;
  error?: string;
  details?: UserStats;
}

export interface UserStats {
  activeUsers: number;
  deletedUsers: number;
  botUsers: number;
  appUsers: number;
}

export interface SlackMessage {
  ts: string;
  user?: string;
  text?: string;
}

export interface TriggerExtractionRequestBody {
  channelName: string;
  startDate: string;
  endDate: string;
  userToEmail: string;
  reviewUserEmail?: string;
  purpose: string;
  outputChannelName?: string; // Channel to send sprint-retro results to
}
