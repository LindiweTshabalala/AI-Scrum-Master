import { GoogleGenAI } from "@google/genai";
import { config } from "config/env";
import { loadPrompt } from "./promptLoader";

const ai = new GoogleGenAI({ apiKey: config.gemini_api_key });

export type AnalysisType = "sprint-retro" | "user-review" | "award-nominations";

export interface AnalysisOptions {
  chatHistory: string;
  author: string;
  type: AnalysisType;
  reviewUserEmail?: string | undefined;
  sprintStart?: string | undefined;
  sprintEnd?: string | undefined;
}

/**
 * Analyzes the provided chat history and returns a sprint retrospective, user review, or award nominations.
 * @param options - Analysis options including chat history, type, and additional parameters
 * @returns A string containing the analysis result based on the specified type
 */
/**
 * Runs AI-powered analysis (retrospective, user review, or award nominations)
 * on provided chat history using a prompt template and returns formatted text.
 */
export async function dataAnalyzer({
  chatHistory,
  author,
  type,
  reviewUserEmail,
  sprintStart,
  sprintEnd,
}: AnalysisOptions): Promise<string> {
  let templateName: string;
  switch (type) {
    case "user-review":
      templateName = "formatUserReview.txt";
      break;
    case "award-nominations":
      templateName = "formatAwardNominations.txt";
      break;
    default:
      templateName = "formatRetrospective.txt";
  }

  const template = await loadPrompt(templateName);

  let prompt = template
    .replace("{{current_date}}", new Date().toISOString())
    .replace("{{chat_history}}", chatHistory);

  switch (type) {
    case "user-review":
      if (reviewUserEmail) {
        prompt = prompt
          .replace("{{review_user_email}}", reviewUserEmail)
          .replace("{{sprint_start}}", sprintStart || "Not specified")
          .replace("{{sprint_end}}", sprintEnd || "Not specified");
      }
      break;
    case "award-nominations":
      prompt = prompt
        .replace("{{start_date}}", sprintStart || "Not specified")
        .replace("{{end_date}}", sprintEnd || "Not specified");
      break;
    default:
      prompt = prompt.replace("{{author}}", author);
  }

  console.log(`Using template: ${templateName}`);
  console.log(`Analysis type: ${type}`);

  const aiResponse = await ai.models.generateContent({
    model: config.ai_model,
    contents: prompt,
  });

  return (aiResponse as any).text ?? JSON.stringify(aiResponse);
}
