import { GoogleGenerativeAI } from "@google/generative-ai";

export const summarizeText = async (req, res) => {
  try {
    // Check API key dynamically each time (in case .env was loaded after module import)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured. Please set it in your .env file." 
      });
    }

    // Initialize Gemini AI with the API key
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required in the request body" });
    }

    // Try different model names - updated to use latest available models
    const modelNames = [
      "gemini-2.0-flash",   // Latest fast model
      "gemini-2.5-flash",   // Latest flash model
      "gemini-2.5-pro",     // Latest pro model
      "gemini-1.5-flash",   // Fallback to older models
      "gemini-1.5-pro",    
      "gemini-pro"          // Original model
    ];

    let model;
    let lastError;
    
    // Try each model name until one works
    for (const modelName of modelNames) {
      try {
        console.log(`Trying model: ${modelName}`);
        model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(text);
        const response = await result.response;
        const summary = response.text();
        
        console.log(`✅ Successfully used model: ${modelName}`);
        return res.json({ summary });
      } catch (modelError) {
        lastError = modelError;
        // If it's not a 404, it might be a different error (like API key issue)
        if (!modelError.message?.includes("404") && !modelError.message?.includes("Not Found")) {
          throw modelError; // Re-throw non-404 errors
        }
        // Continue to next model if this one doesn't exist
        continue;
      }
    }
    
    // If we get here, none of the models worked
    throw lastError || new Error("No available models found");
  } catch (err) {
    console.error("Gemini Error:", err);
    console.error("Error details:", JSON.stringify(err, null, 2));
    
    // Check for specific API key errors
    const errorMessage = err.message || err.toString();
    if (errorMessage.includes("API key not valid") || 
        errorMessage.includes("API_KEY_INVALID") ||
        errorMessage.includes("API key not valid")) {
      return res.status(401).json({ 
        error: "Invalid Gemini API key. Please check your GEMINI_API_KEY in the .env file.",
        details: "Make sure you have a valid API key from https://makersuite.google.com/app/apikey"
      });
    }
    
    // Check if the API needs to be enabled or model not found
    if (errorMessage.includes("404 Not Found") && errorMessage.includes("models")) {
      return res.status(500).json({ 
        error: "Gemini API model not found. Possible causes:",
        causes: [
          "The Generative Language API may not be enabled for your project",
          "Your API key may not have access to the requested model",
          "The model name may not be available for your API key"
        ],
        solution: "Please enable the 'Generative Language API' in Google Cloud Console: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com",
        details: errorMessage
      });
    }
    
    res.status(500).json({ 
      error: "Gemini summarization failed",
      message: errorMessage,
      details: err.cause || err.stack
    });
  }
};
