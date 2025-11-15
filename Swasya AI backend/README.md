# AI Healthcare Backend

A Node.js healthcare backend with dual AI support: Google's Gemini AI (online) and Ollama with Gemma3:1b model (offline) for medical consultation summarization. Includes patient management and consultation tracking.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/your-database-name
GEMINI_API_KEY=your_gemini_api_key_here

# Ollama Configuration (for offline AI)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=gemma3:1b
```

   **To get a Gemini API key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Create a new API key
   - Copy the key and paste it in your `.env` file

   **To set up Ollama (offline AI):**
   - Install Ollama: https://ollama.ai/
   - Pull the Gemma3:1b model: `ollama pull gemma3:1b`
   - Start Ollama service: `ollama serve`

3. Start the server:
```bash
npm start
```

## API Endpoints

### Unified AI Endpoint (Recommended)
**POST** `/ai/summarize` - Auto-selects best available AI (Ollama first, fallback to Gemini)

Request body:
```json
{
  "text": "Your text to summarize here",
  "provider": "auto" // optional: "auto", "ollama", "gemini"
}
```

Response:
```json
{
  "summary": "Generated summary",
  "provider": "ollama",
  "model": "gemma3:1b",
  "offline": true
}
```

### Individual AI Endpoints
**POST** `/gemini/summarize` - Google Gemini (online)
**POST** `/ollama/summarize` - Ollama Gemma (offline)

### Status Endpoints
**GET** `/ai/status` - Check all AI providers
**GET** `/gemini/status` - Check Gemini status
**GET** `/ollama/status` - Check Ollama status

### Patient Management Endpoints
**POST** `/api/patients` - Create new patient
**GET** `/api/patients/:uhid` - Get patient by UHID

### Consultation Endpoints
**POST** `/api/consultations` - Save consultation with AI summary
**GET** `/api/consultations/:uhid` - Get all consultations for a patient

## Patient Registration

Request body for creating a patient:
```json
{
  "name": "John Doe",
  "uhid": "UH001",
  "age": 35,
  "gender": "Male",
  "contact": "+1234567890"
}
```

## Consultation with AI Summary

Request body for saving a consultation:
```json
{
  "uhid": "UH001",
  "transcript": "Patient complains of headache and fever...",
  "aiSummary": "Generated AI summary of consultation",
  "prescriptionData": {
    "medications": ["Paracetamol 500mg"]
  },
  "doctorNotes": "Follow up in 3 days"
}
```

## Features

- **Patient Management**: UHID-based patient registration and lookup
- **Consultation Tracking**: Store medical consultations with AI summaries
- **Dual AI Support**: Online (Gemini) and offline (Ollama) capabilities
- **Auto-fallback**: Automatically tries offline first, falls back to online
- **Provider Selection**: Choose specific AI provider or let system decide
- **Status Monitoring**: Check availability of all AI services