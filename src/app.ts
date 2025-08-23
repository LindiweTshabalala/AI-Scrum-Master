import express, { Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import routes from "./routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "healthy" });
});

app.use(routes);

const PORT = config.port || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
