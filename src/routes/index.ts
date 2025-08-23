import { Router } from "express";
import standupRoutes from "./stand-up/router";

const router = Router();

router.use("/api/stand-up", standupRoutes);

export default router;
