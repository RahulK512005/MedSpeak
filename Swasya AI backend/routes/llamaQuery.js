import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Query LlamaIndex
router.post('/query', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const pythonScript = path.join(__dirname, '../llama/api_query.py');
    const python = spawn('python', [pythonScript, question]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ 
          error: 'Query failed', 
          details: errorOutput 
        });
      }

      try {
        const result = JSON.parse(output);
        res.json(result);
      } catch (e) {
        res.status(500).json({ 
          error: 'Failed to parse response',
          raw: output 
        });
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get example queries
router.get('/examples', (req, res) => {
  res.json({
    examples: [
      "What are the common symptoms across all patients?",
      "List all patients with fever",
      "Show me consultations for AKASH",
      "What medications were prescribed?",
      "Summarize recent consultations"
    ]
  });
});

export default router;
