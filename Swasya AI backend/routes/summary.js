import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Generate bullet point summary from transcript
router.post('/generate-summary', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Convert this medical consultation transcript into structured bullet points:

Transcript: "${transcript}"

Generate a medical summary with these bullet points:
• Chief Complaint: [Main reason for visit]
• Symptoms: [List key symptoms]
• Duration: [How long symptoms present]
• Severity: [Mild/Moderate/Severe if mentioned]
• Associated factors: [Triggers/relieving factors]
• Current medications: [Any medications mentioned]
• Patient concerns: [Specific worries]

Format as clear, concise bullet points for medical documentation.`;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    
    res.json({ summary });
  } catch (error) {
    console.error('Summary generation error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Generate medicine recommendations from symptoms
router.post('/generate-medicines', async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms are required' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Based on these symptoms: "${symptoms}"

Suggest appropriate medications in bullet point format:
• Primary medication: [Main treatment with dosage]
• Secondary medication: [Supporting treatment if needed]
• Symptomatic relief: [For immediate symptom management]
• Duration: [Treatment duration]
• Precautions: [Important warnings or contraindications]
• Follow-up: [When to return if symptoms persist]

Note: This is for informational purposes only. Always consult healthcare professionals for proper diagnosis and treatment.`;

    const result = await model.generateContent(prompt);
    const medicines = result.response.text();
    
    res.json({ medicines });
  } catch (error) {
    console.error('Medicine generation error:', error);
    res.status(500).json({ error: 'Failed to generate medicine recommendations' });
  }
});

// Update consultation with generated summaries
router.put('/update-consultation/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { bulletSummary, medicineRecommendations } = req.body;
    
    const Consultation = (await import('../models/Consultation.js')).default;
    
    const consultation = await Consultation.findByIdAndUpdate(
      id,
      { 
        ...(bulletSummary && { bulletSummary }),
        ...(medicineRecommendations && { medicineRecommendations })
      },
      { new: true }
    );
    
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }
    
    res.json(consultation);
  } catch (error) {
    console.error('Update consultation error:', error);
    res.status(500).json({ error: 'Failed to update consultation' });
  }
});

export default router;