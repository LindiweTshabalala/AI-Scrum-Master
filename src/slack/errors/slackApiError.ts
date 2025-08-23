/**
 * Custom error class for Slack API errors
 */

export class SlackApiError extends Error {
  constructor(
    public slackError: string,
    public httpStatus?: number,
    public retryable: boolean = false
  ) {
    super(`Slack API Error: ${slackError}`);
    this.name = "SlackApiError";
  }

  /**
   * Determines if an error is retryable based on the error type
   */
  static isRetryableError(error: string, httpStatus?: number): boolean {
    const retryableApiErrors = ["ratelimited", "internal_error", "fatal_error"];
    const retryableHttpStatuses = [429, 500, 502, 503, 504];

    return (
      retryableApiErrors.includes(error) ||
      (httpStatus ? retryableHttpStatuses.includes(httpStatus) : false)
    );
  }
}
