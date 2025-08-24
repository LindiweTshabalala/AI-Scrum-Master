import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export type AnalysisType = "sprint-retro" | "user-review";

interface AnalysisOptions {
  chatHistory: string;
  author: string;
  type: AnalysisType;
  reviewUserEmail?: string;
  sprintStart?: string;
  sprintEnd?: string;
}

/**
 * Analyzes the provided chat history and returns either a sprint retrospective or user review summary.
 * @param options - Analysis options including chat history, type, and additional parameters
 * @returns A string containing either the sprint retrospective or user review
 */
export async function dataAnalyzer({
  chatHistory,
  author,
  type,
  reviewUserEmail,
  sprintStart,
  sprintEnd,
}: AnalysisOptions): Promise<string> {
  // Determine which template to use based on analysis type
  const templateName =
    type === "user-review" ? "formatUserReview.txt" : "formatRetrospective.txt";

  // Read the appropriate template
  const promptPath = path.join(
    process.cwd(),
    "src",
    "agents",
    "propmts",
    templateName
  );
  const template = await fs.readFile(promptPath, "utf-8");

  // Fill in the common placeholders
  let prompt = template
    .replace("{{current_date}}", new Date().toISOString())
    .replace("{{chat_history}}", chatHistory);

  // Add type-specific replacements
  if (type === "user-review" && reviewUserEmail) {
    prompt = prompt
      .replace("{{review_user_email}}", reviewUserEmail)
      .replace("{{sprint_start}}", sprintStart || "Not specified")
      .replace("{{sprint_end}}", sprintEnd || "Not specified");
  } else {
    prompt = prompt.replace("{{author}}", author);
  }

  const aiResponse = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: prompt,
  });

  // Return the generated summary as a string
  return (aiResponse as any).text ?? JSON.stringify(aiResponse);
}
