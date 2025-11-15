import express from "express";
import { summarizeWithOllama, checkOllamaStatus } from "../controllers/ollamaController.js";

const router = express.Router();

router.post("/summarize", summarizeWithOllama);
router.get("/status", checkOllamaStatus);

export default router;