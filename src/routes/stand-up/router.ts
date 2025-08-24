import { Router } from "express";
import { sendStandupRequests, receiver } from "./index";

const router = Router();

router.post("/trigger", async (_req, res) => {
  try {
    await sendStandupRequests();
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
export { receiver };
