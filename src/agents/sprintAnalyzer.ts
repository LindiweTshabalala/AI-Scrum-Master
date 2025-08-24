import { GoogleGenAI } from "@google/genai";
import fs from "node:fs/promises";
import path from "node:path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

/**
 * Analyzes the provided chat history and returns a sprint retrospective summary as a string.
 * @param chatHistory - The full chat export from the general channel (plain text)
 * @param author - The email or name of the person requesting the analysis
 * @returns A string summary of the sprint retrospective
 */
export async function sprintAnalyzer(
  chatHistory: string,
  author: string
): Promise<string> {
  // Read the template from the project root
  const promptPath = path.join(
    process.cwd(),
    "src",
    "agents",
    "propmts",
    "formatRetrospective.txt"
  );
  const template = await fs.readFile(promptPath, "utf-8");

  // Fill in the placeholders
  const prompt = template
    .replace("{{current_date}}", new Date().toISOString())
    .replace("{{author}}", author)
    .replace("{{chat_history}}", chatHistory);

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: prompt,
  });

  // Return the generated summary as a string
  return (response as any).text ?? JSON.stringify(response);
}
