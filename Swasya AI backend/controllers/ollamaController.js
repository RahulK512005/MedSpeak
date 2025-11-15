import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' });

export const summarizeWithOllama = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: "Text is required in the request body" });
    }

    const prompt = `Please provide a concise summary of the following text:\n\n${text}`;

    const response = await ollama.chat({
      model: 'gemma3:1b',
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = response.message.content;

    res.json({ 
      summary,
      model: 'gemma3:1b (Ollama)',
      offline: true
    });

  } catch (err) {
    console.error("Ollama Error:", err);
    
    if (err.message?.includes('ECONNREFUSED') || err.message?.includes('connect')) {
      return res.status(503).json({ 
        error: "Ollama service is not running",
        message: "Please start Ollama service with 'ollama serve' command",
        details: err.message
      });
    }

    if (err.message?.includes('model') && err.message?.includes('not found')) {
      return res.status(404).json({ 
        error: "Gemma model not found",
        message: "Please install the gemma3:1b model with 'ollama pull gemma3:1b' command",
        details: err.message
      });
    }

    res.status(500).json({ 
      error: "Ollama summarization failed",
      message: err.message
    });
  }
};

export const checkOllamaStatus = async (req, res) => {
  try {
    const models = await ollama.list();
    const gemmaInstalled = models.models.some(model => model.name.includes('gemma3:1b'));
    
    res.json({
      ollamaRunning: true,
      gemmaInstalled,
      availableModels: models.models.map(m => m.name),
      message: gemmaInstalled 
        ? "Ollama is running and Gemma model is available" 
        : "Ollama is running but Gemma model is not installed"
    });
  } catch (err) {
    res.status(503).json({
      ollamaRunning: false,
      error: "Ollama service is not accessible",
      message: "Please start Ollama service with 'ollama serve' command",
      details: err.message
    });
  }
};