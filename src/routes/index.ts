import { Router } from "express";
import standupRoutes, { receiver as standupReceiver } from "./stand-up/router";
import { receiver as chatsReceiver } from "./chats/routes";

const router = Router();

router.use("/api/stand-up", standupRoutes);
router.use("/api/stand-up", standupReceiver.app);

router.use("/api/chats", chatsReceiver.app);

export default router;
