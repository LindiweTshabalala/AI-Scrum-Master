import { Router } from "express";
import { sendStandupRequests } from "./index";

const router = Router();

/**
 * Triggers stand-up requests to be sent to all active users
 */
router.post("/trigger", async (req, res) => {
  try {
    const botToken = process.env.AI_MIGO_TOKEN;
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
