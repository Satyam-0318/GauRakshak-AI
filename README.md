# 🐄 GauRakshak AI (गौ-रक्षक AI)
### Intelligent Bovine Mastitis Diagnostic & RFID Dairy Herd Health Platform

<p align="center">
  <img src="https://img.shields.io/badge/Accuracy-81.03%25-16a34a?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Accuracy" />
  <img src="https://img.shields.io/badge/Python-3.9%2B-blue?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-Production%20Ready-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-Custom%20Dairy%20Theme-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Database-SQLite%20%2F%20Postgres-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Language-English%20%7C%20%E0%A4%B9%E0%A4%BF%E0%A4%A8%E0%A5%8D%E0%A4%A6%E0%A5%80-FF9933?style=for-the-badge" alt="Bilingual" />
  <img src="https://img.shields.io/badge/Audio-Web%20Speech%20TTS-E11D48?style=for-the-badge" alt="Web Speech TTS" />
</p>

---

## 📖 Overview

**GauRakshak AI** is an end-to-end, rural-first veterinary intelligence platform engineered to detect and categorize **Bovine Mastitis** (थनैल रोग) in dairy cattle before milk reaches the bulk tank. 

By marrying a calibrated **Random Forest machine learning model** with a **low-literacy, high-accessibility interface**, GauRakshak AI empowers both smallholder dairy farmers and commercial herd managers to conduct instant, non-invasive health checks using physiological milk biomarkers (**pH**, **Electrical Conductivity [EC]**, and **Somatic Cell Count [SCC]**).

Every cow is tracked via its unique **RFID Ear Tag**, with test records auto-archived into a local **SQLite database**, complete with full chronological timelines, visual traffic-light severity tags, and **voice audio playback (Text-to-Speech)** in Hindi and English.

---

## 🌟 Key Highlights & Innovations

### 1. 🏷️ Individual Cow RFID Tracking
- Seamless search and selection by **RFID tag** (e.g. `RFID-IND-1001: Gauri`, `RFID-IND-1002: Lakshmi`, `RFID-IND-1003: Kamdhenu`, `RFID-IND-1004: Shyama`).
- 1-click registration modal for newly tagged cows (Tag ID, Name, Indigenous Breed, Herd Notes).
- Every diagnosis auto-saves directly to that cow's historical record in SQLite.

### 2. 👨‍🌾 Low-Literacy & Rural Farmer UX (Touch-First)
- **Minimum 48px Tap Targets**: Large buttons, sliders, and steppers designed for wet or gloved hands in farm sheds.
- **Interactive Numeric Steppers**: Replaced awkward text inputs with smooth range sliders and large `+` / `-` stepper buttons with colored safety zones:
  - 🧪 **pH Slider** (5.8 – 7.6): Safe green zone ($6.4 - 6.7$), Red danger zone ($> 6.8$ alkaline shift).
  - ⚡ **EC Slider** (3.0 – 8.0 mS/cm): Safe green zone ($4.0 - 4.8$), Red danger zone ($> 5.0$ salt leakage).
  - 🔬 **SCC Slider** (0.5 – 15.0 ×$10^5$ cells/mL): Healthy ($<2.0$), Warning ($2.0 - 5.0$), Critical ($>5.0$).
- **Pictograms & Visual Choices**: Visual weather cards for Season (☀️ Winter, ❄️ Summer, 🌧️ Rainy), milk volume cards (🥛 0-4L, 5-10L, >10L), and calving parity pills (1️⃣ 2️⃣ 3️⃣ 4️⃣+).

### 3. 🔊 Voice Assistant (Web Speech API)
- Built-in **"🔊 Tap to hear result / आवाज़ में सुनें"** button.
- Speaks the diagnosis and action plan out loud in pure, natural **Hindi (`hi-IN`)** or **English (`en-US`)** without requiring paid external third-party voice APIs.

### 4. 🚦 3-Color Traffic Light Diagnostic Coding
Dual-labeled with plain agricultural terminology so farmers instantly know what action to take:
* 🟢 **Healthy Udder — Safe Milk** (*स्वस्थ थन — दूध सुरक्षित है*): Bulk tank approved.
* 🟡 **Mild / Subclinical — Caution** (*हल्का संक्रमण — पशु डॉक्टर को दिखाएं*): Hidden mastitis, CMT quarter test advised.
* 🔴 **Severe / Clinical — Urgent Treatment** (*गंभीर थनैल रोग — तुरंत इलाज कराएं*): Immediate antibiotic therapy & milk disposal.

### 5. 🔔 Live Herd Notification & Alert Panel
- Header notification bell with unread badge counter tracking real-time herd health emergencies.
- 1-click inspection: Clicking an alert immediately opens that specific cow's profile and medical timeline.

### 6. 🏛️ Royal Indian Dairy Heritage Branding
- Tailored color palette: Deep Forest Green (`#092615`), Rich Butter Cream (`#faecc4`), and Lawn Olive (`#4f7324`).
- Authentic rural typography using Google Fonts: **Baloo 2** (warm, organic curves), **Poppins** (clean, geometric sans), and **Rubik** (high-contrast data).
- Features the **Royal GauRakshak AI Dairy Crest** medallion and real-time herd quality gauges.

---

## 🩺 The 3 Mastitis Clinical Stages & Biomarkers

| Health Stage | Hindi Label | Typical pH | Conductivity (EC) | Somatic Cell Count (SCC) | Recommended Veterinary Action |
|---|---|:---:|:---:|:---:|---|
| **Healthy Udder** | स्वस्थ थन | $6.40 - 6.70$ | $4.00 - 4.80 \text{ mS/cm}$ | $< 2.0 \times 10^5 \text{ cells/mL}$ | Normal milking approved. Safe for bulk tank processing. |
| **Subclinical** | सब-क्लिनिकल (हल्का) | $6.75 - 6.90$ | $4.90 - 5.30 \text{ mS/cm}$ | $2.0 - 5.0 \times 10^5 \text{ cells/mL}$ | Conduct California Mastitis Test (CMT) to isolate infected quarter. Post-dip sanitization. |
| **Clinical** | क्लिनिकल (गंभीर) | $> 6.95$ | $> 5.40 \text{ mS/cm}$ | $> 5.0 \times 10^5 \text{ cells/mL}$ | Immediate veterinary intervention. Quarantine cow. Discard milk during antibiotic withdrawal. |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    React + Tailwind CSS Frontend (Vite)                 │
│  - Landing Page with Royal Dairy Crest & Live Biomarker Telemetry       │
│  - 3 Core Farmer Sections: Scan & Test • My Cows & History • Guide      │
│  - 48px Accessible Range Sliders with Steppers (pH, EC, SCC)            │
│  - Web Speech API Native Text-to-Speech Engine (Hindi & English)        │
│  - Instant Cow Profile Modal & Chronological Health Timelines           │
│  - Interactive Farm Notification Dropdown for Urgent Herd Alerts        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ JSON REST API (HTTP)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FastAPI Backend API                            │
│  - GET  /health          : Service & Model Readiness Healthcheck        │
│  - POST /predict         : Inference, Biomarker Deviation & Auto-Save   │
│  - GET  /cows            : List All Cows with Test Counts & Last Status │
│  - POST /cows            : 1-Click Register New Cow with RFID Tag       │
│  - GET  /cows/{rfid}     : Cow Dossier & Chronological Prediction List  │
│  - GET  /cows/search?q=  : Search Cows by RFID, Name, or Breed          │
│  - GET  /metrics         : 5-Fold Benchmark Scores & Feature Importance │
└──────────────────────┬───────────────────────────────────┬──────────────┘
                       │                                   │
                       ▼                                   ▼
┌──────────────────────────────────────┐ ┌────────────────────────────────┐
│      mastitis_model.pkl Bundle       │ │      SQLite Database Engine     │
│  - Tuned Random Forest Classifier    │ │      (backend/gaurakshak.db)    │
│  - 200 Estimators, Depth 15          │ │  - cows Table (RFID Primary Key)│
│  - StandardScaler + OneHotEncoder    │ │  - predictions Table (History) │
│  - 81.03% Holdout Accuracy (N=780)   │ │  - ANSI SQL / Postgres Ready   │
└──────────────────────────────────────┘ └────────────────────────────────┘
```

---

## 📊 Model Performance & Feature Importance

The predictive core is a **Random Forest Classifier** trained on physiological bovine parameters:

* **Overall Test Accuracy**: **$81.03\%$** (Holdout test set $N = 780$)
* **Macro F1-Score**: **$81.15\%$**
* **Class-Wise Breakdown**:
  * **Healthy Udder**: Precision $85.8\%$, Recall $85.8\%$, F1 $80.4\%$
  * **Subclinical Mastitis**: Precision $74.6\%$, Recall $74.6\%$, F1 $75.3\%$
  * **Clinical Mastitis**: Precision $82.7\%$, Recall $82.7\%$, F1 $87.8\%$

### Feature Importance Ranking (Why Biomarkers Matter)
Direct physiological milk biomarkers account for **$>91\%$** of total diagnostic decision power:
1. 🔬 **Somatic Cell Count (SCC)**: **$50.7\%$** — Cellular leukocyte infiltration in response to bacterial infection.
2. ⚡ **Electrical Conductivity (EC)**: **$22.6\%$** — Tight-junction breakdown leaking blood $\text{Na}^+$ and $\text{Cl}^-$ into milk.
3. 🧪 **Milk pH**: **$18.1\%$** — Alkaline shift from systemic inflammation and bicarbonate transfer.
4. 🥛 **Parity & Lactation Stage**: **$8.6\%$** — Higher calving parity increases susceptibility to teat canal dilation.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.9+
- Node.js 18+ and npm (optional for development; FastAPI serves pre-built assets out of the box)

---

### Option A: One-Command Startup (Recommended)
Run the automated launch script:
```bash
./run_app.sh
```
This script validates Python and Node environments, starts the FastAPI server on port `8000`, and starts the Vite dev server on port `5173`.

Access the application at:
* 🌐 **Frontend App**: [http://localhost:5173](http://localhost:5173)
* ⚡ **FastAPI Server & Standalone UI**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* 📚 **Interactive Swagger API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Option B: Manual Step-by-Step Startup

#### 1. Backend Setup (FastAPI & SQLite)
```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Start the Uvicorn server
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

#### 2. Frontend Setup (React + Vite)
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install NPM packages
npm install

# 3. Start local development server
npm run dev
```

---

## 📡 REST API Reference

### 1. Health & Model Readiness
`GET /health`
```json
{
  "status": "healthy",
  "service": "GauRakshak AI Diagnostic API",
  "model_loaded": true,
  "model_name": "Random Forest",
  "test_accuracy": 0.8102564102564103,
  "classes": ["Healthy", "Subclinical", "Clinical"]
}
```

### 2. Predict & Auto-Save Cow Diagnosis
`POST /predict`
```json
{
  "rfid": "RFID-IND-1001",
  "pH": 6.80,
  "EC": 5.10,
  "SCC": 3.60,
  "Season": "Winter",
  "LactationStage": "Mid",
  "Parity": "3rd",
  "MilkYield": "5-10"
}
```
**Sample Response:**
```json
{
  "predicted_stage": "Subclinical",
  "predicted_class_index": 1,
  "confidence": 0.8421,
  "probabilities": {
    "Healthy": 0.1215,
    "Subclinical": 0.8421,
    "Clinical": 0.0364
  },
  "biomarkers": {
    "SCC": { "value": 3.6, "unit": "×10⁵ cells/mL", "status": "Elevated", "severity": "medium", "reference": "< 2.0" },
    "EC": { "value": 5.1, "unit": "mS/cm", "status": "Elevated", "severity": "medium", "reference": "4.0 - 4.8" },
    "pH": { "value": 6.8, "unit": "pH", "status": "Alkaline", "severity": "medium", "reference": "6.4 - 6.7" }
  },
  "risk_score": 48,
  "action_code": "INSPECT_CMT",
  "clinical_explanation": "Subclinical mastitis detected. Moderately elevated Somatic Cell Count (3.6 ×10⁵) indicates sub-surface leukocyte infiltration...",
  "veterinary_recommendation": "Conduct a California Mastitis Test (CMT) on all four quarters to isolate infection. Ensure post-milking iodine teat dip.",
  "cow_id": "RFID-IND-1001",
  "saved_to_history": true
}
```

### 3. Fetch Registered Cows
`GET /cows`
Returns all cows in herd with test counts and latest health status.

### 4. Fetch Cow Profile & Timeline
`GET /cows/{rfid}`
Returns cow details and chronological array of all past diagnostic results.

---

## 🧪 Automated Testing

Run the full backend test suite covering predictions, database CRUD, RFID auto-saving, and error boundaries:
```bash
python3 backend/test_backend.py
```
Expected output:
```
==================================================
Running GauRakshak AI Backend Test Suite
==================================================
[PASS] Health endpoint returned model_loaded=True
[PASS] Predict Healthy: Healthy udder correctly classified
[PASS] Predict Subclinical: Subclinical mastitis classified
[PASS] Predict Clinical: Clinical mastitis classified
[PASS] Auto-Save to DB: Prediction linked to RFID history
[PASS] Cow Registration: New cow RFID-TEST-9999 registered
[PASS] Cow History: History timeline retrieved successfully
[PASS] Validation: Bad pH (12.0) rejected with HTTP 422
==================================================
🎉 ALL 8 BACKEND TESTS PASSED SUCCESSFULLY!
==================================================
```

---

## 📁 Repository Structure

```
GauRakshak-AI/
├── backend/
│   ├── main.py                  # FastAPI REST API endpoints
│   ├── model_service.py         # ML inference & biomarker reasoning
│   ├── database.py              # SQLite database schema & CRUD helpers
│   ├── test_backend.py          # Automated test suite
│   ├── requirements.txt         # Python backend dependencies
│   └── gaurakshak.db            # SQLite database (auto-seeded)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx         # Hero with Royal Dairy Crest & Live Gauges
│   │   │   ├── RfidPredictionFlow.jsx  # RFID scan & 48px accessible sliders
│   │   │   ├── CowProfileView.jsx      # Cow cards, history modal & timeline
│   │   │   ├── FarmerHelpGuide.jsx     # 3-color traffic light guide & audio
│   │   │   ├── TopBar.jsx              # Search, language toggle, notification panel
│   │   │   ├── Sidebar.jsx             # 3 primary farmer navigation buttons
│   │   │   ├── ModelMetrics.jsx        # Numbered technical model specs
│   │   │   └── ErrorBoundary.jsx       # Graceful React crash recovery
│   │   ├── translations.js             # Comprehensive English/Hindi dictionary
│   │   ├── App.jsx                     # Core application orchestrator
│   │   └── index.css                   # Tailwind tokens & Google Fonts
│   ├── dist/                           # Compiled production static bundle
│   ├── package.json                    # Node.js dependencies
│   └── vite.config.js                  # Vite configuration
├── mastitis_model.pkl                  # Trained Random Forest model bundle
├── clinical_mastitis_cows.csv          # Clinical dataset
├── train_and_evaluate.py               # Model training & cross-validation script
├── run_app.sh                          # One-command full-stack launcher
├── .gitignore                          # Smart git ignore rules
└── README.md                           # Documentation
```

---

## ⚠️ Veterinary & Research Disclaimer

> [!CAUTION]
> **Decision Support Notice**: GauRakshak AI is an algorithmic decision-support tool trained on physiological dairy cattle biomarkers and calibrated group statistics. It is designed to assist herd managers in early detection and quarantine prioritization. Final clinical decisions, antibiotic administration, or therapy must always be verified using on-farm confirmatory procedures (such as the California Mastitis Test or bacteriological milk culture) and evaluated by a licensed veterinarian.

---

## 🤝 Contributing & License

Contributions, issues, and feature suggestions are warmly welcomed!
- **Repository**: [https://github.com/Satyam-0318/GauRakshak-AI](https://github.com/Satyam-0318/GauRakshak-AI)
- **License**: Released under the [MIT License](LICENSE).

<p align="center">
  <b>गौ-रक्षक AI (GauRakshak AI)</b> — Healthy Cows • Pure Milk • Smarter Detection 🥛🌾
</p>
