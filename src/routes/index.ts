import { Router } from "express";
import standupRoutes from "./stand-up/router";
import { receiver as chatsReceiver } from "./chats/routes";

const router = Router();

router.use("/api/stand-up", standupRoutes);

router.use("/api/chats", chatsReceiver.app);

export default router;
