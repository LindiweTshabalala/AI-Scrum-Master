import { WebClient } from "@slack/web-api";
import { GoogleGenAI } from "@google/genai";
import { getActiveUserIds } from "slack";
import { sendStandupReport } from "routes/stand-up";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
import fs from "node:fs/promises";
import path from "node:path";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function standupAgent(
  questions: string,
  user_response: string,
  author: string
) {
  const promptPath = path.join(
    process.cwd(),
    "src",
    "agents",
    "propmts",
    "formatStandup.txt"
  );
  const promptTemplate = await fs.readFile(promptPath, "utf-8");

  const finalPrompt = promptTemplate
    .replace("{{current_date}}", new Date().toISOString())
    .replace("{{jira_format}}", process.env.JIRA_FORMAT ?? "")
    .replace("{{user_response}}", user_response)
    .replace("{{author}}", author);

  console.log("sending Gemini request");
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
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
    // Wait 1.5 seconds before sending the next message to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
};
