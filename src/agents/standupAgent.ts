import { GoogleGenAI } from "@google/genai";
import { getActiveUserIds } from "../slack";
import { sendStandupReport } from "../routes/stand-up";
import { loadPrompt } from "./promptLoader";
import { config } from "../config/env";

const GEMINI_API_KEY = config.gemini_api_key;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Generates a formatted stand-up report from a raw user response and sends it to the report channel.
 */
export async function standupAgent(
  _questions: string,
  user_response: string,
  author: string
) {
  const promptTemplate = await loadPrompt("formatStandup.txt");

  const finalPrompt = promptTemplate
    .replace("{{current_date}}", new Date().toISOString())
    .replace("{{jira_format}}", config.jira_format)
    .replace("{{user_response}}", user_response)
    .replace("{{author}}", author);

  console.log("sending Gemini request");
  const response = await ai.models.generateContent({
    model: config.ai_model,
    contents: finalPrompt,
  });

  await sendReportToChannel(response.text);
  console.log("received Gemini response");
}

/**
 * Sends the generated stand-up report to the configured stand-up channel for a subset of active users.
 */
const sendReportToChannel = async (response: any) => {
  const activeUserIds = await getActiveUserIds();

  for (let i = 0; i < activeUserIds.length; i++) {
    if (i == 1) {
      break;
    }
    await sendStandupReport(config.daily_standup_id, response);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
};
