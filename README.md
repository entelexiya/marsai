# MarsAI — Onboard Science Selection

> AI-powered adaptive data transmission from Mars rovers to Earth

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## 🌍 Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=https://your-railway-backend.up.railway.app
```

## 🧠 Tech Stack

**Frontend:** Next.js 14, Tailwind CSS, Canvas API, Vercel

**Backend (separate repo):** FastAPI, scikit-learn, sentence-transformers, Railway

## 📡 Backend API Endpoints

```
GET  /status       — System health
GET  /files        — Current file queue
POST /tick         — Process one transmission cycle
POST /reset        — Reset simulation
GET  /mars-delay   — Current Earth-Mars delay
```

## 🏆 AEROO Space AI Competition

This project demonstrates a concept aligned with NASA's onboard autonomy research — an AI system that acts as a scientist aboard a Mars rover, prioritizing scientific data transmission under real bandwidth constraints.
