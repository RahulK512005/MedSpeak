import { GoogleGenerativeAI } from "@google/generative-ai";
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export const summarizeWithAI = async (req, res) => {
  try {
    const { text, transcript, provider = 'auto' } = req.body;
    const inputText = text || transcript;
    
    if (!inputText || inputText.trim().length === 0) {
      return res.status(400).json({ error: "Text is required in the request body" });
    }

    // Auto mode: try Ollama first (offline), fallback to Gemini
    if (provider === 'auto' || provider === 'ollama') {
      const ollamaModels = ['gemma2:2b', 'gemma2:9b', 'llama3.2:1b', 'llama3.2:3b', 'qwen2.5:1.5b'];
      
      for (const modelName of ollamaModels) {
        try {
          const prompt = `You are a medical assistant. Convert this consultation transcript into structured bullet points:

"${inputText}"

Provide a medical summary with these bullet points:
• Chief Complaint: [Main reason for visit]
• Symptoms: [List key symptoms mentioned]
• Duration: [How long symptoms present]
• Severity: [Mild/Moderate/Severe if mentioned]
• Associated factors: [Triggers/relieving factors]
• Current medications: [Any medications mentioned]
• Patient concerns: [Specific worries]

Format as clear, concise bullet points for medical documentation.`;
          
          const response = await ollama.chat({
            model: modelName,
            messages: [{ role: 'user', content: prompt }],
          });

          return res.json({ 
            summary: response.message.content,
            provider: 'ollama',
            model: modelName,
            offline: true
          });
        } catch (modelError) {
          console.log(`Ollama model ${modelName} failed:`, modelError.message);
          continue;
        }
      }
      
      console.log("All Ollama models failed, trying Gemini...");
      
      // If provider was specifically 'ollama', don't fallback
      if (provider === 'ollama') {
        return res.status(500).json({ 
          error: "Ollama service unavailable",
          message: "Please ensure Ollama is running and has models installed",
          suggestion: "Run: ollama pull gemma2:2b"
        });
      }
    }

    // Try Gemini (online)
    if (provider === 'auto' || provider === 'gemini') {
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      
      if (!GEMINI_API_KEY) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured and Ollama is not available" 
        });
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const modelNames = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

      for (const modelName of modelNames) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `You are a medical assistant. Convert this consultation transcript into structured bullet points:

"${inputText}"

Provide a medical summary with these bullet points:
• Chief Complaint: [Main reason for visit]
• Symptoms: [List key symptoms mentioned]
• Duration: [How long symptoms present]
• Severity: [Mild/Moderate/Severe if mentioned]
• Associated factors: [Triggers/relieving factors]
• Current medications: [Any medications mentioned]
• Patient concerns: [Specific worries]

Format as clear, concise bullet points for medical documentation.`;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const summary = response.text();
          
          return res.json({ 
            summary,
            provider: 'gemini',
            model: modelName,
            offline: false
          });
        } catch (modelError) {
          if (!modelError.message?.includes("404")) {
            throw modelError;
          }
          continue;
        }
      }
    }

    throw new Error("No AI provider available");

  } catch (err) {
    console.error("AI Error:", err);
    
    res.status(500).json({ 
      error: "AI summarization failed",
      message: err.message,
      suggestion: "Try starting Ollama service or check your Gemini API key"
    });
  }
};

export const getAIStatus = async (req, res) => {
  const status = {
    ollama: { available: false, models: [] },
    gemini: { available: false, configured: false }
  };

  // Check Ollama
  try {
    const models = await ollama.list();
    status.ollama.available = true;
    status.ollama.models = models.models.map(m => m.name);
    status.ollama.gemmaInstalled = models.models.some(model => model.name.includes('gemma3:1b'));
  } catch (err) {
    status.ollama.error = err.message;
  }

  // Check Gemini
  status.gemini.configured = !!process.env.GEMINI_API_KEY;
  if (status.gemini.configured) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      await model.generateContent("test");
      status.gemini.available = true;
    } catch (err) {
      status.gemini.error = err.message;
    }
  }

  res.json({
    status,
    recommendation: status.ollama.available 
      ? "Ollama is available for offline use" 
      : status.gemini.available 
        ? "Only Gemini (online) is available"
        : "No AI providers are currently available"
  });
};