# Nepal-US Hackathon (Team 10)
## Team Details
| Name | Role |
|---|---|
| Dipika Bogati | ML pipeline, FastAPI backend |
| Prastut Dahal | React Native mobile app, UI/UX |
| Ujjwal Kuikel| Wearable model development and integration |
| Dipesh KC | Product Design, Slide deck preparation, Demo editing |
| Ilesh Shrestha | Product Design, Presentation, Creative help  |

---

# Sahara — साहारा

> A proactive, wearable-powered mental health companion for Nepali students and professionals — built for the Nepali Leaders Network Mental Health Hackathon.

---

## What is साहारा?

साहारा detects emotional deterioration **before the user consciously feels it** — using physiological signals from wearables — and connects them to culturally grounded AI support.

Most mental health apps wait for you to come to them. साहारा watches quietly, notices the signs in your body (declining HRV, poor sleep, elevated resting heart rate), and reaches out first — with a warm nudge, not an alarm.

साहारा addresses both hackathon problem statements:
- **Statement 1** — Reducing career pressure, burnout, and uncertainty for students and professionals
- **Statement 2** — Lowering mental health stigma and improving early support in culturally conservative communities

---
## Key Features

- **Proactive detection** — ML model scores daily wearable data and fires a nudge before a crisis, not after
- **Two specialized agents** — each agent is named, voiced, and prompted for a specific kind of struggle
- **RAG pipeline** — agents grounded in counseling guidelines via vector search, not just raw LLM generation
- **Recovery-focused UI** — home screen shows what went *well* this week

---
## Tech Stack

| Layer | Technology |
|---|---|
| Mobile frontend | React Native (iOS + Android) |
| Backend API | Python FastAPI + Uvicorn |
| ML model | LightGBM + SHAP |
| Training data | LifeSnaps dataset (71 users, 4 months, Fitbit Sense) + STAI + PANAS surveys |
| Baseline cache | Redis (per-user 7-day rolling window) |
| LLM agents | GPT-4o / Claude API |
| RAG pipeline | FastAPI + vector search (counseling PDFs) |
| Push notifications | Firebase Cloud Messaging + APNs |
| Wearable APIs | Apple HealthKit, Garmin Connect IQ, Fitbit Web API (Simulated with sample test data via API for now) |
| Event pipeline | Firebase (events + vectors) |

---
## Architecture Overview
<img width="1058" height="885" alt="image" src="https://github.com/user-attachments/assets/c742ec32-ff5d-4423-9d34-ce5f44ae768c" />

---


## Project Structure

```
Sahara/
├── backend/
 └── ...                      # FastAPI backend (RAG, Wearable integration, Firebase)
├── ml_training/
  └── ...                      # ML training
├── frontend/
│   └── ...                      # React Native app

└── README.md
```

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- Redis running locally or via Docker
- Firebase project with FCM enabled
- Llm API key

### 1. Clone

```bash
git clone https://github.com/dahalprastut/sahara
cd mutu
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:

```env
OPENAI_API_KEY=sk-...          # or ANTHROPIC_API_KEY
REDIS_URL=redis://localhost:6379
FIREBASE_CREDENTIALS=path/to/firebase.json
MODEL_PATH=../ml/model.pkl
```

Run the API:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Train the ML model

Download the LifeSnaps dataset from [Kaggle](https://www.kaggle.com/datasets/skywescar/lifesnaps-fitbit-dataset) and place CSVs in `data/lifesnaps/`.

```bash
cd ml
pip install lightgbm pandas numpy scikit-learn shap
python train.py
# outputs model.pkl
```

### 4. RAG pipeline (optional for hackathon demo)

Place counseling guideline PDFs in `backend/rag/docs/`, then:

```bash
python backend/rag/ingest.py
# chunks PDFs and builds vector index
```

### 5. Mobile app

```bash
cd mobile
npm install
npx expo start
```

---

## ML Model — How It Works

The prediction model is a **LightGBM binary classifier** trained on the [LifeSnaps dataset](https://www.kaggle.com/datasets/skywescar/lifesnaps-fitbit-dataset) — 71 participants, 4 months of real-world Fitbit Sense data.

**Label:** `TENSE/ANXIOUS` from daily ecological momentary assessment (EMA) mood surveys.
`1` = intervention needed, `0` = no intervention.

**Features used:**

| Category | Features |
|---|---|
| HRV | `rmssd`, `rmssd_deviation`, `rmssd_trend_3d`, `rmssd_7d_baseline` |
| Heart rate | `resting_hr`, `nremhr`, `hr_deviation` |
| Sleep | `sleep_duration_hrs`, `sleep_efficiency`, `sleep_deep_ratio`, `sleep_rem_ratio`, `sleep_deviation`, `sleep_trend_3d` |
| Physiological | `nightly_temperature`, `daily_temperature_variation`, `spo2`, `full_sleep_breathing_rate`, `scl_avg` |
| Activity | `steps`, `sedentary_minutes`, `very_active_minutes`, `lightly_active_minutes`, `calories` |
| Surveys | `stai_score` (forward-filled weekly), `negative_affect` (PANAS, forward-filled) |

**Key design decisions:**
- `GroupShuffleSplit` by `user_id` — model is validated on users it has never seen
- `class_weight='balanced'` — handles imbalance (more OK days than bad days)
- 7-day rolling per-user baselines computed before training — deviation from personal normal is more predictive than absolute values

**Inference payload** (what the wearable sends):

```json
{
  "rmssd": 67.4,
  "resting_hr": 64,
  "sleep_duration_hrs": 5.2,
  "sleep_efficiency": 81,
  "steps": 4200,
  "spo2_avg": 96.1,
  "nightly_temperature": 34.1,
  "rmssd_7d": 89.2,
  "sleep_7d": 7.1,
  "hr_7d": 61.0,
  "stai_score": 46.0,
  "negative_affect": 14.0
}
```

**Response:**

```json
{
  "risk_score": 0.74,
  "send_notification": true,
  "top_factors": [
    { "feature": "sleep_deviation",  "impact": -0.34 },
    { "feature": "rmssd_deviation",  "impact": -0.28 },
    { "feature": "sedentary_minutes","impact":  0.21 }
  ],
  "suggested_agent": "thahar"
}
```

---

Each agent receives a system prompt containing:
- Persona + tone instructions (warm, non-clinical, culturally Nepali)
- User's onboarding profile
- Current wearable state + SHAP top factors
- Last 3 session summaries

---

## Onboarding Questions

Conducted as a conversation — never as a form:

1. How old are you?
2. What does your typical day look like?
3. What's been weighing on you most lately?
4. How has your sleep been feeling recently?
5. Is there usually someone around you can lean on?
6. When things get hard, what do you usually do?
7. How comfortable are you talking about how you feel?
8. Is there anything you'd like Mutu to know before we begin? *(open text)*

---

## Notification Design

Notifications are warm, non-clinical, and specific — powered by SHAP top factors:

> *"Timro nidra akhiri 3 din dekhi kam chha. Kura garne mann chha?"*
> *(Your sleep has been low for 3 days. Want to talk?)*

Rules:
- Minimum 6-hour cooldown between notifications
- Fires when `risk_score > 0.65` OR anomaly detected (HRV 20%+ below personal baseline)
- Opens directly into `suggested_agent` — zero extra taps

---

## Dataset & Acknowledgements

- **LifeSnaps** — Yfantidou et al., 2022. 4-month multi-modal dataset from the RAIS Experiment. [Kaggle](https://www.kaggle.com/datasets/skywescar/lifesnaps-fitbit-dataset)
- **STAI** — Spielberger State-Trait Anxiety Inventory
- **PANAS** — Watson et al., Positive and Negative Affect Schedule

---

## License

MIT License — see `LICENSE` for details.

---

*Built with care for Nepal. सबै साहारा।*
