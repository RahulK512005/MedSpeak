import express from "express";
import { summarizeWithAI, getAIStatus } from "../controllers/aiController.js";

const router = express.Router();

router.post("/summarize", summarizeWithAI);
router.get("/status", getAIStatus);

export default router;