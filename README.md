# SmartShield v2

**Secure Transaction Monitoring System** — A full-stack real-time UPI fraud detection platform built with React (Vite) and FastAPI.

---

## Overview

SmartShield v2 combines a machine learning risk engine, behavioral anomaly detection, and visual verification into a unified transaction monitoring platform. It exposes a React dashboard for analysts and a FastAPI backend that scores incoming transactions in under 50ms.

**Key capabilities:**
- Real-time transaction risk assessment using Random Forest + Isolation Forest
- Behavioral anomaly detection via unsupervised scoring
- Visual QR code and payment screenshot verification
- Live monitoring feed with status filtering
- Full analytics suite with model performance metrics
- Explainability panel with SHAP-style factor breakdown
- JWT-authenticated multi-user access

---

## Folder Structure

```
smartshield-v2/
├── frontend/
│   ├── src/
│   │   ├── components/        # Shared UI primitives, Sidebar, AppLayout
│   │   ├── hooks/             # useAuth context
│   │   ├── pages/             # Login, Signup, Dashboard, Assessment,
│   │   │                      #   VisualVerification, Monitoring, Analytics,
│   │   │                      #   Explainability
│   │   ├── services/          # axios API service layer
│   │   ├── App.jsx            # Router + auth guards
│   │   ├── main.jsx           # ReactDOM entry
│   │   └── index.css          # Global design tokens
│   ├── public/
│   │   └── shield.svg         # Favicon
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── nginx.conf             # Nginx SPA config for Docker
│   ├── Dockerfile
│   └── .env.example
│
├── backend/
│   ├── main.py                # FastAPI application + all endpoints
│   ├── model.py               # ML training, scoring, fusion logic
│   ├── sample_data.csv        # Training dataset (100 labelled transactions)
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
└── README.md
```

---

## Local Setup

### Prerequisites

| Tool    | Version  |
|---------|----------|
| Node.js | 18+      |
| Python  | 3.10+    |
| pip     | latest   |
| npm     | 9+       |

---

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```

The first run automatically trains the ML model on `sample_data.csv` and saves `rf_model.joblib`, `scaler.joblib`, and `iso_model.joblib`.

API docs are available at: **http://localhost:8000/docs**

---

### 2. Frontend

Open a second terminal:

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** in your browser.

---

### 3. Create an account

1. Navigate to `/signup`
2. Enter your name, email, and a password (min. 6 characters)
3. You will be redirected to the dashboard automatically

---

## API Endpoints

| Method | Endpoint             | Description                          | Auth |
|--------|----------------------|--------------------------------------|------|
| POST   | `/auth/signup`       | Create a new user account            | No   |
| POST   | `/auth/login`        | Obtain a JWT access token            | No   |
| GET    | `/auth/me`           | Get current authenticated user       | Yes  |
| POST   | `/predict`           | Run transaction risk assessment      | Yes  |
| POST   | `/verify/qr`         | Scan a QR code for tampering         | Yes  |
| POST   | `/verify/screenshot` | Verify a payment screenshot          | Yes  |
| GET    | `/stats/summary`     | Dashboard summary statistics         | Yes  |
| GET    | `/health`            | Health check                         | No   |

### Example `/predict` request

```json
POST /predict
Authorization: Bearer <token>

{
  "amount": 95000,
  "tx_type": "Fund Transfer",
  "city": "Patna",
  "device": "Redmi Note 13",
  "velocity_1h": 6,
  "velocity_24h": 22
}
```

### Example `/predict` response

```json
{
  "transaction_id": "SS1718000000ABC123",
  "timestamp": "2025-06-10T14:32:11.000Z",
  "input": { "amount": 95000, "tx_type": "Fund Transfer", "city": "Patna", "device": "Redmi Note 13" },
  "rf_score": 82.4,
  "iso_score": 61.2,
  "visual_score": 48.7,
  "final_risk": 72.1,
  "status": "FLAGGED",
  "fraud_probability": 82.4,
  "factors": [
    "Transaction amount exceeds high-value threshold",
    "High transaction velocity in past hour",
    "Geographic risk score elevated for this location"
  ]
}
```

---

## Docker Usage

### Build and run both services

```bash
# From the project root
docker-compose up --build
```

| Service  | URL                         |
|----------|-----------------------------|
| Frontend | http://localhost:3000       |
| Backend  | http://localhost:8000       |
| API Docs | http://localhost:8000/docs  |

### Stop services

```bash
docker-compose down
```

### Rebuild after code changes

```bash
docker-compose up --build --force-recreate
```

---

## Deployment

### Frontend → Vercel

1. Push the `frontend/` directory to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repository.
3. Set the **Framework Preset** to **Vite**.
4. Set **Root Directory** to `frontend`.
5. Add environment variable:
   ```
   VITE_API_URL = https://your-backend.onrender.com
   ```
6. Click **Deploy**.

**Live URL format:** `https://smartshield-v2.vercel.app`

---

### Backend → Render

1. Push the `backend/` directory to GitHub (same or separate repo).
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect your repository. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3.11
4. Add environment variable:
   ```
   SECRET_KEY = your-strong-secret-key-here
   ```
5. Click **Create Web Service**.

**Live URL format:** `https://smartshield-api.onrender.com`

---

## Environment Variables

### Backend

| Variable     | Default                                      | Description              |
|--------------|----------------------------------------------|--------------------------|
| `SECRET_KEY` | `smartshield-dev-secret-key-change-in-production` | JWT signing secret  |

### Frontend

| Variable        | Default                   | Description           |
|-----------------|---------------------------|-----------------------|
| `VITE_API_URL`  | `http://localhost:8000`   | Backend API base URL  |

---

## ML Model Details

The backend trains a **Random Forest classifier** (200 trees) on 8 features extracted from each transaction:

| Feature        | Description                                |
|----------------|--------------------------------------------|
| `amount`       | Transaction value in INR                   |
| `tx_hour`      | Hour of day (0–23)                         |
| `tx_day`       | Day of week (0=Monday)                     |
| `city_risk`    | Pre-computed city risk index (0.0–1.0)     |
| `device_trust` | Device trust score based on model          |
| `velocity_1h`  | Number of transactions in past hour        |
| `velocity_24h` | Number of transactions in past 24 hours    |
| `tx_type`      | Encoded transaction category               |

**Fusion formula:**
```
Final Risk Index = (RF Score × 0.5) + (Isolation Forest Score × 0.3) + (Visual Score × 0.2)
```

**Decision thresholds:**
- `> 55` → FLAGGED
- `32–55` → UNDER REVIEW
- `< 32` → CLEARED

---

## Secure Transaction Monitoring System · SmartShield Technologies · v2.4.1
