import fs from "node:fs/promises";
import path from "node:path";

const PROMPTS_DIR = path.join(process.cwd(), "src", "agents", "prompts");

/** Loads a prompt file from the agents/prompts directory. */
export async function loadPrompt(filename: string): Promise<string> {
  const fullPath = path.join(PROMPTS_DIR, filename);
  return fs.readFile(fullPath, "utf-8");
}

/** Builds an absolute path to a prompt file (does not read it). */
export function buildPromptPath(filename: string): string {
  return path.join(PROMPTS_DIR, filename);
}
