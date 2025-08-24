import { Router } from "express";
import { sendStandupRequests } from "./index";
import { config } from "../../config/env";

const router = Router();

router.post("/trigger", async (_req, res) => {
  try {
    const botToken = config.ai_migo_token;
    if (!botToken) {
      throw new Error("AI_MIGO_TOKEN is not configured");
    }

    await sendStandupRequests(botToken);
    res.json({ success: true, message: "Stand-up requests sent successfully" });
  } catch (error) {
    console.error("Failed to send stand-up requests:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send stand-up requests",
    });
  }
});

export default router;
