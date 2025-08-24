import { WebClient } from "@slack/web-api";
import { GoogleGenAI } from "@google/genai";
import { getActiveUserIds } from "../slack";
import { sendStandupReport } from "../routes/stand-up";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
import { loadPrompt } from "./promptLoader";
import { config } from "config/env";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function standupAgent(
  _questions: string,
  user_response: string,
  author: string
) {
  const promptTemplate = await loadPrompt("formatStandup.txt");

  const finalPrompt = promptTemplate
    .replace("{{current_date}}", new Date().toISOString())
    .replace("{{jira_format}}", process.env.JIRA_FORMAT ?? "")
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

const sendReportToChannel = async (response: any) => {
  const botToken = process.env.AI_MIGO_TOKEN ?? "";
  const client = new WebClient(botToken);
  const activeUserIds = await getActiveUserIds(botToken);

  for (let i = 0; i < activeUserIds.length; i++) {
    if (i == 1) {
      break;
    }
    await sendStandupReport(
      client,
      process.env.DAILY_STANDUP_ID ?? "",
      response
    );
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
};
