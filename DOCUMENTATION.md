# MarsAI — Technical Documentation

> **Version:** 1.0.0 | **Status:** Live | **Competition:** AEROO Space AI Competition 2024
>
> 🌐 [Live Demo](https://marsai-six.vercel.app) · 🔧 [API Docs](https://entelexiya-marsai-backend.hf.space/docs) · 📦 [Backend Repo](#) · 🖥️ [Frontend Repo](#)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [ML Pipeline — Deep Dive](#3-ml-pipeline--deep-dive)
   - 3.1 [IsolationForest — Anomaly Detection](#31-isolationforest--anomaly-detection)
   - 3.2 [Sentence Transformer — Semantic Scoring](#32-sentence-transformer--semantic-scoring)
   - 3.3 [CLIP Vision — Image Analysis](#33-clip-vision--image-analysis)
   - 3.4 [Channel Predictor — Bandwidth Forecasting](#34-channel-predictor--bandwidth-forecasting)
   - 3.5 [Random Forest — Final Classifier](#35-random-forest--final-classifier)
4. [Mission Profiles](#4-mission-profiles)
5. [API Reference](#5-api-reference)
6. [Data Pipeline & Training](#6-data-pipeline--training)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Deployment](#8-deployment)
9. [Performance & Benchmarks](#9-performance--benchmarks)
10. [File Types & Priority Logic](#10-file-types--priority-logic)
11. [Development Setup](#11-development-setup)
12. [Project Structure](#12-project-structure)
13. [Team](#13-team)

---

## 1. Project Overview

### Problem Statement

A Mars rover like Perseverance collects approximately **2 GB of scientific data per day** — images from ZCAM, chemical spectra from CHEMCAM, atmospheric readings from MEDA, seismic signals from SEIS, and X-ray data from PIXL. However, the communication window with Earth is only **10–20 minutes per day**, with a signal delay of **3–22 minutes** depending on orbital geometry. This means only about **200 MB** — roughly 10% of collected data — can be transmitted per day.

Without an intelligent prioritization system, low-value housekeeping data can crowd out potentially groundbreaking findings: a methane spike that could indicate biological activity, an anomalous mineral deposit, or a magnitude 3.2 marsquake.

### Solution

MarsAI is an **autonomous, onboard-deployable AI system** that analyzes every file in the transmission queue and assigns it a priority status in real time. It operates without any connection to external APIs or cloud services — a requirement for deep space deployment where latency makes cloud inference impossible.

The system uses a **cascade of 5 machine learning models**, each adding a layer of intelligence, culminating in a Random Forest classifier that outputs one of four transmission statuses:

| Status | Meaning |
|--------|---------|
| `critical` | Transmit immediately — scientifically anomalous or high-value |
| `sending` | Actively being transmitted in current window |
| `queued` | Scheduled for transmission |
| `pending` | Low priority, transmit only if bandwidth allows |

### Key Design Principles

- **Autonomy first** — no external API calls, all inference runs locally
- **Mission-awareness** — behavior adapts to the physics of each mission type
- **Explainability** — every decision is traceable to specific feature contributions
- **Real-time operation** — pipeline executes in under 3 seconds per tick

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│                  Next.js 14  (Vercel CDN)                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐  │
│  │   Hero.js    │  │  DemoSection.js  │  │   TryItSection.js    │  │
│  │  Canvas API  │  │  Live queue sim  │  │  File analysis UI    │  │
│  │  Starfield   │  │  Auto-tick loop  │  │  PDF upload / CLIP   │  │
│  └──────────────┘  └──────────────────┘  └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │  REST (JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER                                    │
│              FastAPI  (HuggingFace Spaces, 2 CPU / 16 GB)          │
│                                                                     │
│  /tick ──► decision_engine.py ──► 5 ML models ──► queue update     │
│  /analyze ──► single file scoring                                   │
│  /analyze_pdf ──► PyMuPDF extract ──► Sentence Transformer         │
│  /nasa_image ──► NASA APOD API ──► CLIP scoring                    │
│  /channel/history ──► EMA + LinReg history                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       ML MODEL LAYER                                │
│                                                                     │
│  IsolationForest  │  Sentence Transformer  │  CLIP ViT-B/32        │
│  (nasa_isolation  │  (all-MiniLM-L6-v2,   │  (~290 MB,            │
│   _forest.pkl)    │   lazy-loaded)         │   lazy-loaded)        │
│                   │                        │                        │
│  EMA + LinReg Channel Predictor            │                        │
│                   │                        │                        │
│  RandomForestClassifier (10k samples, 15 features)                 │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | File | Responsibility |
|-----------|------|----------------|
| `main.py` | Backend | FastAPI app, all endpoint handlers |
| `decision_engine.py` | Backend | All 5 ML models, scoring logic (533 lines) |
| `mission_configs.py` | Backend | Per-mission parameters, semantic reference sets |
| `satellite_files.py` | Backend | Mission-specific synthetic file generator |
| `channel_simulator.py` | Backend | Bandwidth & packet loss simulation per mission |
| `nasa_data_trainer.py` | Backend | IsolationForest training script |
| `page.js` | Frontend | Root component, global mission state |
| `DemoSection.js` | Frontend | Auto-ticking queue visualization |
| `TryItSection.js` | Frontend | Manual file analysis, PDF & NASA image upload |

---

## 3. ML Pipeline — Deep Dive

The pipeline processes every file in the queue on each `/tick` call. Models run sequentially; outputs from earlier models feed into the final classifier as features.

```
File metadata
     │
     ├──► [1] IsolationForest ──────────► is_anomaly (bool)
     │
     ├──► [2] Sentence Transformer ──────► semantic_score (0.0–1.0)
     │
     ├──► [3] CLIP Vision (if image) ────► clip_score (0.0–1.0)
     │
     ├──► [4] EMA + LinReg ──────────────► pred_bw_norm, channel_volatility
     │
     └──► [5] Random Forest ─────────────► status: critical|sending|queued|pending
               (15 features total)
```

---

### 3.1 IsolationForest — Anomaly Detection

**Purpose:** Identify files whose sensor readings are statistically unusual compared to baseline Perseverance telemetry. Unusual readings are elevated to `critical` priority because anomalies are discoveries.

**Training Data:** Real NASA MEDA (Mars Environmental Dynamics Analyzer) data from the Perseverance rover, sols 1–847, downloaded from the NASA PDS (Planetary Data System) Open Archive.

**Features used for training:**

| Feature | Description | Typical Range |
|---------|-------------|---------------|
| `temperature` | Atmospheric temperature (°C) | -89 to -17 |
| `pressure` | Atmospheric pressure (Pa) | 700 to 751 |
| `chemical_index` | Composite chemical anomaly score | dynamic |
| `radiation` | Radiation flux reading | dynamic |
| `humidity` | Relative humidity reading | dynamic |

**Contamination parameter:** `0.05` (5% of training data treated as outliers), tuned to match known anomaly rates in Perseverance telemetry.

**Output:** Binary `is_anomaly` flag. When `True`, the file's base priority score is boosted significantly before entering the Random Forest.

**Model artifact:** `nasa_isolation_forest.pkl` (serialized with `joblib`)

**Training script:**
```bash
python nasa_data_trainer.py
# Outputs: nasa_isolation_forest.pkl
# Logs:    Training set size, contamination rate, sample anomaly rate
```

---

### 3.2 Sentence Transformer — Semantic Scoring

**Model:** `sentence-transformers/all-MiniLM-L6-v2`
- 6-layer MiniLM architecture
- 384-dimensional sentence embeddings
- ~22 MB model size
- Inference: ~5ms per file on CPU

**Purpose:** Score each file's textual description by its semantic similarity to a mission-specific set of "high-value discovery" reference sentences. A file describing a methane spike should score near 1.0; a file describing a routine system check should score near 0.0.

**Mechanism:**
1. Encode the file's `description` field into a 384-dim embedding
2. Encode the mission's reference sentences (see `mission_configs.py`)
3. Compute cosine similarity between file embedding and each reference
4. Return the **maximum** similarity as `semantic_score`

**Mission-specific reference sentences (examples):**

| Mission | High-value references |
|---------|----------------------|
| Mars | `"methane spike detected"`, `"biosignature candidate"`, `"unusual mineral deposit"`, `"seismic anomaly"` |
| Satellite | `"flood detected"`, `"wildfire boundary"`, `"disaster response imagery"` |
| Lunar | `"helium-3 deposit"`, `"water ice confirmation"`, `"seismic event"` |
| Deep Space | `"gravitational anomaly"`, `"magnetic field shift"`, `"unknown signal source"` |

**Output:** `semantic_score` float in range [0.0, 1.0]

**Lazy loading:** The model is loaded once on first use and cached in memory to avoid repeated 22 MB disk reads.

---

### 3.3 CLIP Vision — Image Analysis

**Model:** `openai/clip-vit-base-patch32`
- Vision Transformer (ViT-B/32) image encoder
- ~290 MB model size
- Processes files of type `IMG`, `OPT`, `SAR`

**Purpose:** Estimate the scientific value of image files by comparing their visual content to mission-specific text descriptions of high-value discoveries.

**Mechanism:**
1. Load image from file path
2. Encode image with CLIP's ViT-B/32 vision encoder
3. Encode mission-specific positive text prompts (e.g., `"unusual rock formation on Mars"`, `"mineral deposit"`)
4. Encode negative text prompts (e.g., `"empty terrain"`, `"normal ground"`)
5. Compute softmax over [positive, negative] similarities
6. Return positive probability as `clip_score`

**Output:** `clip_score` float in range [0.0, 1.0]

**Fallback:** For non-image files or when CLIP is unavailable, `clip_score` defaults to `0.5` (neutral).

**Lazy loading:** CLIP model (~290 MB) is loaded once and cached. Initial load takes ~8–12 seconds on HuggingFace Spaces CPU.

---

### 3.4 Channel Predictor — Bandwidth Forecasting

**Purpose:** Forecast the bandwidth available in the next tick so the Random Forest can make forward-looking decisions — e.g., hold back a large file if bandwidth is predicted to drop.

**Architecture:** Ensemble of two components:

```
predicted_bw = 0.6 × EMA(recent_bw_history) + 0.4 × LinearRegression(recent_bw_history)
```

**EMA component:**
- Smoothing factor `α = 0.3`
- Tracks the last 10 bandwidth readings
- Resistant to single-tick noise spikes

**Linear Regression component:**
- Fits a line over the last 10 bandwidth readings
- Extrapolates one step forward
- Captures directional trends (e.g., improving signal as relay satellite rises above horizon)

**Volatility detection:**
- `channel_volatility = std(recent_bw_history) / mean(recent_bw_history)`
- When `volatility > threshold`, the prediction regresses toward the historical mean to avoid overconfident extrapolation

**Output features passed to Random Forest:**

| Feature | Description |
|---------|-------------|
| `pred_bw_norm` | Predicted bandwidth (normalized 0–1) |
| `channel_volatility` | Coefficient of variation of recent bandwidth |
| `bandwidth_norm` | Current normalized bandwidth |
| `packet_loss` | Current packet loss % |
| `latency` | Current latency ms |

**Update frequency:** Every tick (3 seconds simulated)

---

### 3.5 Random Forest — Final Classifier

**Model:** `sklearn.ensemble.RandomForestClassifier`

**Training data:** 10,000 synthetic mission samples generated by `satellite_files.py`, covering all 4 mission types, with realistic distributions of file types, sizes, sensor readings, and channel conditions.

**Train/test split:** 85% / 15%

**Feature set (15 features):**

| # | Feature | Type | Description |
|---|---------|------|-------------|
| 1 | `bandwidth_norm` | float [0,1] | Current normalized bandwidth |
| 2 | `packet_loss` | float [0,1] | Current packet loss fraction |
| 3 | `latency` | float | Current latency in ms |
| 4 | `priority` | float | File base priority score |
| 5 | `file_size` | float | File size in MB |
| 6 | `is_anomaly` | int {0,1} | Output of IsolationForest |
| 7 | `semantic_score` | float [0,1] | Output of Sentence Transformer |
| 8 | `pred_bw_norm` | float [0,1] | Predicted future bandwidth |
| 9 | `size_bw_ratio` | float | `file_size / current_bandwidth` |
| 10 | `file_type` | int (encoded) | Encoded file type (IMG, CHEM, etc.) |
| 11 | `instrument_priority` | float | Instrument importance weight (mission-specific) |
| 12 | `sol_age_norm` | float [0,1] | Data freshness — normalized sol age |
| 13 | `data_ratio` | float | Scientific importance ratio |
| 14 | `clip_score` | float [0,1] | Output of CLIP Vision model |
| 15 | `channel_volatility` | float | Channel stability metric |

**Output classes:** `critical`, `sending`, `queued`, `pending`

**Hyperparameters:**
```python
RandomForestClassifier(
    n_estimators=100,
    max_depth=None,
    min_samples_split=2,
    random_state=42
)
```

**Performance metrics** (on held-out 15% test set):

| Metric | Score |
|--------|-------|
| Accuracy | ~92% |
| Precision (macro avg) | ~91% |
| Recall (macro avg) | ~90% |
| F1 Score (macro avg) | ~91% |

> Live metrics always available at `/metrics` endpoint.

---

## 4. Mission Profiles

MarsAI supports 4 distinct mission profiles, each with unique physics, bandwidth constraints, and priority logic. Switching missions via `/mission` endpoint reconfigures the entire pipeline.

### 4.1 Mars (Default)

| Parameter | Value |
|-----------|-------|
| Signal latency | 3–22 minutes |
| Bandwidth | 0.5–6 Mbps |
| Daily data volume | ~2 GB |
| Contact window | 10–20 min/day |
| Main constraint | Distance + relay geometry |

**Transmission policy:** Only `critical`, `sending`, and `queued` files are transmitted. `pending` files are held back — every byte counts.

**Instrument priority weights:**

| Instrument | File prefix | Priority weight |
|------------|-------------|-----------------|
| ZCAM (camera) | `ZCAM_` | 0.7 |
| CHEMCAM (chemistry) | `CHEMCAM_` | 0.9 |
| MEDA (atmosphere) | `MEDA_` | 0.6 |
| SEIS (seismic) | `SEIS_` | 0.85 |
| PIXL (X-ray) | `PIXL_` | 0.95 |

### 4.2 LEO Satellite

| Parameter | Value |
|-----------|-------|
| Signal latency | ~20 ms |
| Bandwidth | 10–150 Mbps |
| Daily data volume | ~50 GB |
| Contact window | 10 min / 90-min orbit |
| Main constraint | Limited contact windows |

**Transmission policy:** All statuses transmitted including `pending`. Good bandwidth, maximize data return per pass.

**Priority focus:** Disaster detection, flood mapping, wildfire boundaries, emergency response imagery.

### 4.3 Lunar

| Parameter | Value |
|-----------|-------|
| Signal latency | 1.3 seconds |
| Bandwidth | 1–20 Mbps |
| Daily data volume | ~500 MB |
| Contact window | Near-continuous |
| Main constraint | Bandwidth ceiling |

**Transmission policy:** All statuses transmitted. Relatively comfortable communication environment.

**Priority focus:** Water ice confirmation, helium-3 deposits, seismic events, regolith composition.

### 4.4 Deep Space

| Parameter | Value |
|-----------|-------|
| Signal latency | 1–8 hours |
| Bandwidth | 0.001–0.08 Mbps |
| Daily data volume | ~10 MB |
| Contact window | DSN schedule |
| Main constraint | Extreme distance |

**Transmission policy:** Only `critical` files transmitted. Bandwidth is so limited that even `queued` files may wait days or weeks.

**Priority focus:** Gravitational anomalies, magnetic field shifts, unknown signals, heliopause measurements.

---

## 5. API Reference

**Base URL:** `https://entelexiya-marsai-backend.hf.space`

All endpoints return JSON. The API is publicly accessible with no authentication required.

---

### `GET /tick`

Advance the simulation by one tick (3 simulated seconds). Runs the full ML pipeline on all files in the current queue and returns updated statuses.

**Response:**
```json
{
  "files": [
    {
      "id": "CHEMCAM_methane_spike.csv",
      "type": "CHEM",
      "size_mb": 3.2,
      "status": "critical",
      "priority": 0.94,
      "is_anomaly": true,
      "semantic_score": 0.87,
      "clip_score": null,
      "instrument_priority": 0.9,
      "description": "Sudden methane spike: 21 ppb above baseline"
    }
  ],
  "channel": {
    "bandwidth_mbps": 4.2,
    "packet_loss": 0.02,
    "latency_ms": 1320000,
    "predicted_bandwidth": 3.8,
    "volatility": 0.12
  },
  "mission": "mars",
  "sol": 847,
  "tick": 142
}
```

---

### `GET /state`

Returns the current queue state without advancing the simulation.

**Response:** Same structure as `/tick`.

---

### `POST /reset`

Resets the simulation to initial state with a fresh file queue.

**Body:** `{}` (empty)

**Response:**
```json
{ "status": "reset", "mission": "mars" }
```

---

### `POST /analyze`

Analyze a single file and return its ML scores without adding it to the queue.

**Request body:**
```json
{
  "filename": "ZCAM_SOL847_unusual_deposit.jpg",
  "type": "IMG",
  "size_mb": 12.4,
  "description": "Unusual red-brown mineral deposit, possible hematite concretions",
  "instrument": "ZCAM",
  "sol_age": 0
}
```

**Response:**
```json
{
  "status": "critical",
  "priority": 0.88,
  "is_anomaly": true,
  "semantic_score": 0.79,
  "clip_score": 0.72,
  "instrument_priority": 0.7,
  "reasoning": {
    "anomaly_detected": true,
    "semantic_match": "unusual mineral deposit",
    "bandwidth_factor": 0.85
  }
}
```

---

### `POST /analyze_pdf`

Upload a PDF document. The backend extracts text using PyMuPDF, then runs the Sentence Transformer to score scientific relevance.

**Request:** `multipart/form-data` with field `file`

**Response:**
```json
{
  "filename": "sol847_report.pdf",
  "extracted_text_length": 4821,
  "semantic_score": 0.63,
  "recommended_status": "queued",
  "top_matching_keywords": ["mineral deposit", "atmospheric reading"]
}
```

---

### `POST /mission`

Switch the active mission profile. Resets the queue and reconfigures all mission-specific parameters.

**Request body:**
```json
{ "mission": "lunar" }
```

**Accepted values:** `"mars"`, `"satellite"`, `"lunar"`, `"deep_space"`

---

### `GET /missions`

List all available mission profiles with their parameters.

**Response:**
```json
{
  "missions": [
    {
      "id": "mars",
      "name": "Mars Rover",
      "latency_ms": 1320000,
      "bandwidth_mbps_range": [0.5, 6.0],
      "daily_data_gb": 2.0,
      "transmit_statuses": ["critical", "sending", "queued"]
    }
  ]
}
```

---

### `GET /metrics`

Returns current Random Forest model performance metrics.

**Response:**
```json
{
  "accuracy": 0.921,
  "precision": 0.908,
  "recall": 0.897,
  "f1_score": 0.912,
  "training_samples": 10000,
  "test_samples": 1500,
  "feature_count": 15,
  "classes": ["critical", "sending", "queued", "pending"]
}
```

---

### `GET /nasa_image`

Fetches a random Mars image from NASA's image API, runs CLIP analysis, and returns the score.

**Response:**
```json
{
  "image_url": "https://...",
  "title": "Perseverance Captures Dust Devil",
  "clip_score": 0.68,
  "recommended_status": "queued",
  "mission": "mars"
}
```

---

### `GET /channel/history`

Returns the last N bandwidth readings used by the channel predictor.

**Response:**
```json
{
  "history": [4.2, 3.8, 4.1, 3.5, 3.9, 4.4, 4.0, 3.7, 3.6, 3.8],
  "ema_value": 3.85,
  "predicted_next": 3.72,
  "volatility": 0.08
}
```

---

### `GET /status`

Server health check.

**Response:**
```json
{
  "status": "ok",
  "models_loaded": {
    "isolation_forest": true,
    "sentence_transformer": true,
    "clip": true,
    "random_forest": true
  },
  "uptime_seconds": 14823
}
```

---

## 6. Data Pipeline & Training

### NASA MEDA Data

The IsolationForest anomaly detector is trained on real sensor data from the Perseverance rover's MEDA instrument.

**Data source:** NASA PDS (Planetary Data System) Open Archive  
**URL:** `https://pds.nasa.gov/`  
**Dataset:** MEDA Level 2 data, sols 1–847  
**Format:** CSV with per-sol sensor readings

**Download and preprocess:**
```bash
python nasa_data_trainer.py --download --sols 1 847
```

**Training process:**
```python
from sklearn.ensemble import IsolationForest
import joblib

# Features: temperature, pressure, chemical_index, radiation, humidity
X_train = load_meda_features(sols=range(1, 848))

model = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)
model.fit(X_train)

joblib.dump(model, "nasa_isolation_forest.pkl")
```

### Synthetic Training Data for Random Forest

Since labeled priority decisions don't exist for real rover files, the Random Forest is trained on synthetic data generated by `satellite_files.py`.

**Generation logic:**
- Randomly sample mission parameters (bandwidth, latency, packet loss)
- Randomly generate file metadata (type, size, instrument, sol age)
- Apply domain-expert rules to assign ground-truth labels:
  - Anomalous files with high semantic scores → `critical`
  - Large files during low bandwidth → `pending`
  - High instrument priority + anomaly → `critical`
  - etc.

**Training:**
```bash
python train_random_forest.py --samples 10000 --missions all
```

---

## 7. Frontend Architecture

The frontend is a **Next.js 14 (App Router)** single-page application.

### Component Tree

```
app/page.js  (mission state, global context)
├── Hero.js
│   └── Canvas API starfield + Mars animation
├── DemoSection.js
│   ├── MissionSelector.js
│   ├── FileQueueList.js  (status badges, animated updates)
│   └── ChannelStats.js  (bandwidth chart)
├── TechSection.js
│   └── Architecture diagram (SVG)
└── TryItSection.js
    ├── FileAnalyzer.js  (manual JSON input → /analyze)
    ├── PDFUploader.js   (drag-drop → /analyze_pdf)
    └── NASAImageAnalyzer.js  (→ /nasa_image)
```

### Auto-tick Loop

`DemoSection.js` runs an interval that calls `/tick` every **3 seconds** when the demo is active:

```javascript
useEffect(() => {
  if (!isRunning) return;
  const interval = setInterval(async () => {
    const data = await fetch(`${API_URL}/tick`).then(r => r.json());
    setQueue(data.files);
    setChannel(data.channel);
  }, 3000);
  return () => clearInterval(interval);
}, [isRunning]);
```

### Mission State

Mission selection is managed at the root `page.js` level and propagated via React Context. Switching missions calls `POST /mission` and resets the local queue state.

---

## 8. Deployment

### Backend — HuggingFace Spaces

The FastAPI backend runs on a HuggingFace Spaces instance with:
- **CPU:** 2 vCPUs
- **RAM:** 16 GB
- **Runtime:** Python 3.10

**`requirements.txt`:**
```
fastapi
uvicorn
scikit-learn
sentence-transformers
transformers
torch
Pillow
PyMuPDF
numpy
joblib
httpx
```

**Start command:**
```bash
uvicorn main:app --host 0.0.0.0 --port 7860
```

**Model loading strategy:** CLIP and Sentence Transformer are loaded lazily on first request to minimize startup time. IsolationForest and Random Forest load at startup from `.pkl` files.

**CORS:** Configured to allow requests from `https://marsai-six.vercel.app` and `localhost:3000`.

### Frontend — Vercel

Auto-deployed from the main GitHub branch on every push.

**Environment variables:**
```env
NEXT_PUBLIC_API_URL=https://entelexiya-marsai-backend.hf.space
```

**Build command:** `npm run build`  
**Output directory:** `.next`

---

## 9. Performance & Benchmarks

### ML Model Inference Times (HuggingFace Spaces, 2 CPU)

| Model | First load | Per-file inference |
|-------|-----------|-------------------|
| IsolationForest | < 100ms | ~0.5ms |
| Sentence Transformer | ~8s (cold) | ~5ms |
| CLIP ViT-B/32 | ~12s (cold) | ~80ms |
| Channel Predictor (EMA + LinReg) | < 1ms | < 1ms |
| Random Forest | < 200ms | ~1ms |
| **Full pipeline (10 files)** | — | **~150ms** |

> After warm-up, a full `/tick` with 10 files completes in under 200ms.

### Random Forest — Per-class Metrics

| Class | Precision | Recall | F1 |
|-------|-----------|--------|----|
| `critical` | 0.94 | 0.91 | 0.92 |
| `sending` | 0.89 | 0.88 | 0.88 |
| `queued` | 0.90 | 0.92 | 0.91 |
| `pending` | 0.91 | 0.93 | 0.92 |

---

## 10. File Types & Priority Logic

### Supported File Types

| Type code | Description | CLIP analysis | Base priority |
|-----------|-------------|---------------|---------------|
| `IMG` | Optical images (ZCAM) | ✓ | Medium |
| `CHEM` | Chemical spectrometry | ✗ | High |
| `ATM` | Atmospheric readings | ✗ | Medium |
| `SEISM` | Seismic data | ✗ | High |
| `PIXL` | X-ray fluorescence | ✗ | High |
| `OPT` | Optical/multispectral | ✓ | Medium |
| `SAR` | Synthetic aperture radar | ✓ | Medium |
| `TLM` | Housekeeping telemetry | ✗ | Low |

### Priority Score Composition

The `priority` feature fed to the Random Forest is computed as:

```
priority = (
    0.35 × semantic_score
  + 0.25 × is_anomaly
  + 0.20 × instrument_priority
  + 0.10 × clip_score          # 0.5 for non-image files
  + 0.10 × freshness_score     # 1.0 - sol_age_norm
)
```

This composite score is one of 15 features; the Random Forest may override it based on channel conditions.

---

## 11. Development Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- ~3 GB disk space (for CLIP model)

### Backend

```bash
# Clone
git clone https://github.com/[org]/marsai-backend
cd marsai-backend

# Install dependencies
pip install -r requirements.txt

# Train IsolationForest on NASA MEDA data
python nasa_data_trainer.py

# Train Random Forest
python train_random_forest.py --samples 10000

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
# Clone
git clone https://github.com/entelexiya/marsai
cd marsai

# Install dependencies
npm install

# Configure backend URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Running Tests

```bash
# Backend unit tests
pytest tests/ -v

# API integration tests (requires running server)
pytest tests/integration/ -v --base-url http://localhost:8000
```

---

## 12. Project Structure

```
marsai-backend/
├── main.py                      # FastAPI app, all endpoints
├── decision_engine.py           # 5 ML models, scoring logic (533 lines)
├── mission_configs.py           # Mission configs, semantic reference sentences
├── satellite_files.py           # Mission-specific file generator
├── channel_simulator.py         # Mission-aware channel simulation
├── nasa_data_trainer.py         # IsolationForest training script
├── train_random_forest.py       # Random Forest training script
├── nasa_isolation_forest.pkl    # Trained IsolationForest artifact
├── random_forest_model.pkl      # Trained Random Forest artifact
├── requirements.txt
└── tests/
    ├── test_decision_engine.py
    ├── test_channel_simulator.py
    └── integration/
        └── test_api_endpoints.py

marsai/ (frontend)
├── app/
│   └── page.js                  # Root page, mission state
├── components/
│   ├── Hero.js                  # Canvas space animation
│   ├── DemoSection.js           # Live queue simulation
│   ├── TechSection.js           # Architecture diagram
│   ├── TryItSection.js          # File analysis UI
│   └── MissionSelector.js       # Mission switcher
├── public/
├── .env.local
└── package.json
```

---

## 13. Team

**Built for AEROO Space AI Competition 2024**  
Түркістан, Қазақстан

| Name | Role | Contributions |
|------|------|---------------|
| **Нұрахмет Ілесбай** | ML Engineer | ML pipeline architecture, IsolationForest & RandomForest implementation, system integration |
| **Бұйрабай Нұрсезім** | Team Captain | NASA data collection & preprocessing, PDF/CSV parsing, dataset preparation |
| **Қыдырбек Жания** | Frontend | Next.js 14 dashboard, Canvas animations, Vercel deployment |
| **Құралбек Дәулет** | Research | Technical documentation, dataset curation, research support |

---

## License

This project was built for the AEROO Space AI Competition 2024. Training data sourced from NASA PDS Open Archive under NASA's open data policy.

---

*Documentation version 1.0.0 — last updated February 2026*
