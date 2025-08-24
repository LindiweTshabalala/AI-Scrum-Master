import fs from "node:fs/promises";
import path from "node:path";

const PROMPTS_DIR = path.join(process.cwd(), "src", "agents", "prompts");

export async function loadPrompt(filename: string): Promise<string> {
  const fullPath = path.join(PROMPTS_DIR, filename);
  return fs.readFile(fullPath, "utf-8");
}

export function buildPromptPath(filename: string): string {
  return path.join(PROMPTS_DIR, filename);
}
