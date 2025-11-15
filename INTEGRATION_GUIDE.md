# Swasya AI Frontend-Backend Integration Guide

## Setup Instructions

### 1. Install Backend Dependencies
```bash
cd "Swasya AI backend"
npm install cors
```
Or run: `install-cors.bat`

### 2. Environment Setup
Make sure your backend `.env` file has:
```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

### 3. Start the Applications

#### Option A: Manual Start
1. Backend: `cd "Swasya AI backend" && npm start`
2. Frontend: `cd "Swasya AI frontend" && npm run dev`

#### Option B: Use Batch Scripts
1. Run `start-backend.bat` in one terminal
2. Run `start-frontend.bat` in another terminal

## Integration Features

### ✅ Completed Integrations

1. **CORS Configuration**: Backend now accepts requests from frontend (localhost:3000)
2. **API Service Layer**: Created `/lib/api.ts` with typed API functions
3. **Dynamic Data Loading**: Consultation grid now fetches real data from backend
4. **Patient Creation**: New consultation modal creates patients via API
5. **Loading States**: Added proper loading indicators
6. **Error Handling**: Basic error handling for API calls

### 🔄 API Endpoints Integrated

- `GET /api/patients` - Fetch all patients
- `POST /api/patients` - Create new patient
- `GET /api/consultations` - Fetch all consultations
- `POST /api/consultations` - Create new consultation
- `POST /ai/summarize` - Generate AI summaries

### 📱 Frontend Components Updated

- `consultation-grid.tsx` - Now uses real API data
- `new-consultation-modal.tsx` - Creates patients via API
- Added loading states and error handling

## Next Steps

### 🚧 Remaining Integrations

1. **Recording Integration**: Connect audio recording to transcription API
2. **AI Summary Generation**: Integrate with Gemini/Ollama for consultation summaries
3. **Prescription Upload**: Handle image uploads and processing
4. **Real-time Updates**: Add WebSocket or polling for live updates
5. **Authentication**: Add user authentication system

### 🛠 Recommended Enhancements

1. Add toast notifications for success/error messages
2. Implement data validation on both frontend and backend
3. Add pagination for large datasets
4. Implement search and filtering
5. Add offline support with local storage

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running on port 5000 and CORS is configured
2. **API Connection**: Check if backend server is accessible at `http://localhost:5000`
3. **Database Connection**: Verify MongoDB connection string in `.env`
4. **Missing Dependencies**: Run `npm install` in both frontend and backend directories

### Testing the Integration

1. Start both servers
2. Open `http://localhost:3000` in browser
3. Try creating a new consultation
4. Check if data appears in the consultation grid
5. Verify backend logs for API calls

## Architecture Overview

```
Frontend (Next.js) ←→ Backend (Express.js) ←→ Database (MongoDB)
     ↓                      ↓                      ↓
- React Components    - REST API Routes      - Patient Model
- API Service Layer   - Controllers          - Consultation Model
- UI Components       - AI Integration       - Data Persistence
```

The integration is now functional with basic CRUD operations. The system can create patients, store consultations, and display data dynamically from the backend.