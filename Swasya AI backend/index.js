import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import geminiRouter from "./routes/gemini.js";
import ollamaRouter from "./routes/ollama.js";
import aiRouter from "./routes/ai.js";
import patientRoutes from "./routes/patients.js";
import consultationRoutes from "./routes/consultations.js";
import llamaQueryRouter from "./routes/llamaQuery.js";
import dashboardRouter from "./routes/dashboard.js";
import summaryRouter from "./routes/summary.js";

dotenv.config();

// Debug: Check if API key is loaded (don't log the actual key for security)
console.log('🔑 GEMINI_API_KEY loaded:', process.env.GEMINI_API_KEY ? `Yes (${process.env.GEMINI_API_KEY.length} characters)` : 'No');

connectDB();

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get("/", (req, res) => {
  res.json({ message: "Server is running", port: process.env.PORT || 5000 });
});

app.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ 
    server: "running", 
    database: dbStatus 
  });
});

app.get("/gemini/status", (req, res) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  const apiKeyLength = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0;
  res.json({
    geminiConfigured: hasApiKey,
    apiKeyPresent: hasApiKey,
    apiKeyLength: apiKeyLength,
    message: hasApiKey 
      ? "Gemini API key is configured" 
      : "Gemini API key is missing. Please set GEMINI_API_KEY in your .env file"
  });
});

// Test endpoint to try different models
app.get("/gemini/test", async (req, res) => {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    const results = [];
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        results.push({ model: modelName, status: "✅ Works" });
      } catch (err) {
        results.push({ 
          model: modelName, 
          status: "❌ Failed", 
          error: err.message?.substring(0, 100) 
        });
      }
    }
    
    res.json({ 
      message: "Model availability test",
      results 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/gemini", geminiRouter);
app.use("/ollama", ollamaRouter);
app.use("/ai", aiRouter);
app.use("/api/patients", patientRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/llama", llamaQueryRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/summary", summaryRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
