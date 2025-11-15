# 🚀 MedSpeak Deployment Guide

## ✅ Successfully Deployed to Vercel

### 📱 Frontend (Next.js)
**Production URL:** https://medspeak-frontend-8kpdznd9i-rahuls-projects-8971527f.vercel.app

**Features:**
- AI Insights Dashboard
- Consultation Management
- Patient History
- Prescription Management
- Responsive UI with Shadcn components

### 🔧 Backend (Node.js/Express)
**Production URL:** https://medspeak-backend-ju6qddhjh-rahuls-projects-8971527f.vercel.app

**API Endpoints:**
- `/api/patients` - Patient management
- `/api/consultations` - Consultation records
- `/api/llama/query` - LlamaIndex AI queries
- `/gemini/*` - Gemini AI integration
- `/ollama/*` - Ollama integration

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://medspeak-backend-ju6qddhjh-rahuls-projects-8971527f.vercel.app
```

### Backend (Vercel Dashboard)
Set these in Vercel Project Settings → Environment Variables:
```env
MONGO_URI=your_mongodb_atlas_uri
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key (optional)
OLLAMA_HOST=http://localhost:11434 (for local only)
```

## 📝 Post-Deployment Steps

1. **Add Environment Variables in Vercel:**
   - Go to https://vercel.com/dashboard
   - Select `medspeak-backend` project
   - Settings → Environment Variables
   - Add MONGO_URI, GEMINI_API_KEY, etc.

2. **Update Frontend API URL:**
   - Go to `medspeak-frontend` project
   - Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` with backend URL

3. **Redeploy Both Projects:**
   ```bash
   vercel --prod
   ```

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

## 📊 Monitoring

- **Frontend Logs:** https://vercel.com/rahuls-projects-8971527f/medspeak-frontend
- **Backend Logs:** https://vercel.com/rahuls-projects-8971527f/medspeak-backend

## 🛠️ Local Development

```bash
# Frontend
cd "Swasya AI frontend"
npm install --legacy-peer-deps
npm run dev

# Backend
cd "Swasya AI backend"
npm install
npm start
```

## ⚠️ Known Limitations

1. **Python LlamaIndex:** Vercel doesn't support Python runtime for the LlamaIndex queries
   - Solution: Deploy Python backend separately (Railway, Render, or AWS Lambda)
   - Or use serverless functions with Python runtime

2. **MongoDB Connection:** Ensure MongoDB Atlas allows Vercel IPs
   - Go to MongoDB Atlas → Network Access
   - Add `0.0.0.0/0` (allow from anywhere) or Vercel IPs

3. **CORS:** Update backend CORS to allow Vercel frontend domain

## 🎯 Next Steps

- [ ] Add custom domain
- [ ] Set up environment variables
- [ ] Deploy Python backend separately
- [ ] Configure MongoDB Atlas network access
- [ ] Update CORS settings
- [ ] Set up monitoring and alerts

---

**Deployed on:** November 15, 2025  
**GitHub:** https://github.com/RahulK512005/MedSpeak
