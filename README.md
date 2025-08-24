# AI-Scrum-Master

## Overview
AI-Scrum-Master is an AI-powered Slack bot designed to automate the extraction of insights from team standups, generate actionable reports for individuals and teams, and recognize key contributors for company awards. Built by Team AImigos for the BBD AI Hackathon 2025, our solution aligns with the hackathon’s theme of **GAINS** by empowering teams to work smarter and recognize excellence.

## Key Features
- **Automated Standup Analysis:** Collects and analyzes daily standup messages from Slack using Google Gemini AI.
- **Executive & Team Reports:** Generates clear, executive-ready summaries and detailed team updates.
- **Annual Review Support:** Produces objective, actionable feedback for individual performance reviews.
- **Award Nominations:** Identifies and nominates team members for company awards based on real contributions (e.g., Call of Duty, Uncharted, Among Us, Retro Ranger).
- **Seamless Integration:** Works directly with Slack and supports Jira ticket linking.

## How It Works
1. Team members submit standups in Slack.
2. The bot collects and analyzes messages using advanced AI prompts.
3. Generates:
	- Standup summaries
	- Sprint retrospectives
	- Individual user reviews
	- Award nomination reports
4. Results are delivered in Slack or as downloadable files.

## Project Structure
```
src/
  app.ts                # Express app entry point
  agents/               # AI prompt templates and analyzers
  config/               # Environment config
  routes/               # API endpoints
  server/               # Server startup
  slack/                # Slack integration, services, and types
  utils/                # Utility functions
```

## Setup & Usage
1. Clone the repository.
2. Install dependencies:
	```
	npm install
	```
3. Configure your `.env` file (see `.env.example`).
4. Start the app:
	```
	npm run dev
	```

## Hackathon Context
- **Team:** AImigos
- **Event:** BBD AI Hackathon 2025
- **Theme:** GAINS
- **Project Goal:** Empower teams with AI-driven productivity, recognition, and actionable insights from real team interactions.

## License
MIT