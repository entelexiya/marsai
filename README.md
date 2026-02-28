---
title: MarsAI Backend
emoji: 🚀
colorFrom: red
colorTo: blue
sdk: docker
pinned: false
---
# MarsAI Backend

FastAPI backend with 5 ML models for onboard science selection.

## https://marsai-six.vercel.app/

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /status | System health + stats |
| GET | /files | Current file queue |
| POST | /tick | Run one simulation cycle |
| POST | /reset | Reset simulation |
| GET | /mars-delay | Current Earth-Mars delay |
| POST | /mars-delay | Set delay manually |
| GET | /channel/history | Bandwidth history for charts |

## Models

1. **IsolationForest** — anomaly detection in sensor readings
2. **Sentence Transformer (MiniLM)** — semantic value of file descriptions  
3. **LinearRegression** — channel bandwidth prediction
4. **RandomForest** — final send/queue/drop decision (trained on 8000 samples)
5. **CLIP Vision** — Image analysis 

This project demonstrates a concept aligned with NASA's onboard autonomy research — an AI system that acts as a scientist aboard a Mars rover, prioritizing scientific data transmission under real bandwidth constraints.
=======
# marsai
>>>>>>> fea7d0c9b679715b978419bed19b7bd3706ba006
