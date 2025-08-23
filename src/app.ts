import { configDotenv } from "dotenv";

configDotenv();

const APP_MANAGEMENT_TOKEN = process.env.ADMIN_MANAGER_TOKEN;

// Define the app manifest configuration using YAML syntax in a template literal.
const appManifest = `
  _metadata:
    major_version: 1
    minor_version: 1
  display_information:
    name: Project Manager Bot
    description: A bot that helps with the management of the project
  features:
    bot_user:
      display_name: PM-Bot
      always_online: false
  oauth_config:
    scopes:
      bot:
        - channels:history
        - chat:write
        - commands
  settings:
    org_deploy_enabled: false
    socket_mode_enabled: false
    token_rotation_enabled: false
`;

// The API endpoint for creating an app from a manifest.
const apiUrl = "https://slack.com/api/apps.manifest.create";

/**
 * An async function to create a Slack app from a manifest using the fetch API.
 */
async function createApp() {
  // The Slack API expects the data to be in 'application/x-www-form-urlencoded' format.
  // URLSearchParams is the standard way to build this.
  const payload = new URLSearchParams({
    manifest: appManifest,
  });

  try {
    // Make the POST request using the fetch API.
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${APP_MANAGEMENT_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });

    // The response from fetch needs to be parsed as JSON.
    const responseData = await response.json();

    // Check the 'ok' field in the response to see if the request was successful.
    if (responseData.ok) {
      console.log("App created successfully! ✅");

      const appId: string = responseData.app_id;
      const botToken: string = responseData.oauth_token;

      console.log(`App ID: ${appId}`);
      console.log(`Bot Token: ${botToken}`);
    } else {
      // If 'ok' is false, log the error returned by the Slack API.
      console.error(`Error creating app: ${responseData.error}`);
    }
  } catch (error) {
    // Handle potential network errors or issues with the fetch request.
    console.error("An unexpected error occurred:", error);
  }
}

// Run the function to create the app.
createApp();
