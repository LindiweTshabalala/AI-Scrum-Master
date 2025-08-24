import { WebClient } from "@slack/web-api";
import { GoogleGenAI } from "@google/genai";
import { getActiveUserIds } from "slack";
import { sendStandupReport } from "routes/stand-up";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function gemini(questions: string, user_response: string, author: string) {
  console.log("sending Gemini request")
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: `I'm a scrum master and these are the questions i've sent to my teammates for an automated standup: ${questions}. 
    This is the response ${user_response}. 
    Generate a report of where they are. This is going to be sent to a slack channel. 
    Please format the response text to look good on slack. Also just include the report (dont make it markdown) and not anything you did. 
    Make it a report with some text for the execs to get a clear picture of where the team is at and make sure to group the formatted stand-up response by each user using their email address ${author}.
    Include today's date which is ${new Date()}  in 2025-08-24T00:06:52.971Z format which i want converted to day fullmonth year format. 
    This is the format of our jira ${process.env.JIRA_FORMAT}, so link ticket numbers using this.`,
  });

  await sendReportToChannel(response.text);
  console.log("received Gemini response")
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
