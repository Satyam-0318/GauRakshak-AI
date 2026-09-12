# GauRakshak AI: Dairy Mastitis Clinical Prediction Platform

A modern, production-grade diagnostic web application that serves a trained machine learning classification engine for detecting and categorizing **Bovine Mastitis** in dairy cows.

The system evaluates raw milk biophysical indicators (**pH**, **Electrical Conductivity (EC)**, and **Somatic Cell Count (SCC)**) along with environmental and herd variables (**Season**, **Lactation Stage**, **Parity**, and **Milk Yield**) to provide real-time risk assessment across three clinical stages:
1. **Healthy Udder** ($\text{SCC} < 2.0 \times 10^5 \text{ cells/mL}$)
2. **Subclinical Mastitis** ($2.0 \le \text{SCC} \le 5.0 \times 10^5 \text{ cells/mL}$)
3. **Clinical Mastitis** ($\text{SCC} > 5.0 \times 10^5 \text{ cells/mL}$)

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React + Tailwind CSS Frontend               │
│  - Single Cow Diagnostic UI with 1-Click Presets            │
│  - Real-time physiological range validation                 │
│  - Color-coded severity cards (Emerald / Amber / Rose)       │
│  - Recharts ensemble probability distributions               │
│  - Herd Screening: Batch CSV upload & enriched CSV export   │
│  - Model Transparency: Per-class F1, confusion matrix, SHAP │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON (HTTP)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend API                     │
│  - GET  /health          : Service & model availability     │
│  - POST /predict         : Single cow inference & reasoning │
│  - POST /predict/batch   : Multi-record JSON screening      │
│  - POST /predict/upload-csv : Multipart CSV batch screening │
│  - GET  /metrics         : Benchmark scores & importances   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  mastitis_model.pkl Bundle                  │
│  - Estimator: Tuned Random Forest (200 trees, depth 15)     │
│  - Preprocessor: ColumnTransformer                         │
│     * StandardScaler on ['pH', 'EC', 'SCC']                 │
│     * OneHotEncoder on Season, LactationStage, Parity, Yield│
│  - Calibrated Test Accuracy: 81.03% (Holdout N=780)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Single Cow Diagnostic Engine
- **Bilingual Interface (English & हिन्दी)**: One-click header toggle between English and Hindi, translating all headings, forms, tooltips, clinical explanations, and veterinary guidance.
- **Trained Model Indicator**: Prominent real-time status showing **"Trained Model Active: Random Forest • 81.0% Acc"** (or **"प्रशिक्षित मॉडल सक्रिय"**), highlighting the loaded machine learning pipeline.
- **Instant Presets**: Pre-configured buttons for **Sample Healthy** (*स्वस्थ गाय का नमूना*), **Sample Subclinical** (*सब-क्लिनिकल नमूना*), and **Sample Clinical** (*क्लिनिकल नमूना*) profiles for rapid demonstration.
- **Biomarker Range Monitoring**: Visual alerts and field-level validation for physiological boundaries:
  - **Milk pH**: Normal $6.40 - 6.70$ (acidic to neutral; inflammation drives alkaline shift $> 6.80$).
  - **Electrical Conductivity (EC)**: Normal $4.00 - 4.80\text{ mS/cm}$ (tissue damage causes $\text{Na}^+$ and $\text{Cl}^-$ leakage $> 5.20\text{ mS/cm}$).
  - **Somatic Cell Count (SCC)**: Healthy $< 2.0 \times 10^5\text{ cells/mL}$; clinical frequently reaches $20 - 50+\times 10^5\text{ cells/mL}$.
- **Diagnostic Result Card**:
  - Color-coded stage banner (Emerald for Healthy, Amber for Subclinical, Rose for Clinical).
  - Model confidence percentage.
  - Softmax probability distribution bar chart across all three classes.
  - Biomarker status chips and percentage deviations from healthy reference baselines.
  - Plain-language clinical reasoning explaining which biomarker triggered the diagnosis.
  - Actionable veterinary guidance (e.g. California Mastitis Test (CMT), quarter isolation, antibiotic therapy).
  - Quick Reset / "Analyze Another Cow" button.

### 2. Herd Screening Mode (Batch CSV)
- **CSV Upload**: Drag-and-drop or select any CSV file containing `pH, EC, SCC`.
- **Sample CSV Generator**: One-click download of a pre-formatted `sample_mastitis_cows.csv` template.
- **Summary Metrics**: High-level counts and percentage breakdown of Healthy, Subclinical, and Clinical cows across the herd.
- **Filterable Results Table**: Instant filtering by diagnosis stage.
- **Enriched Export**: Export predictions, confidence scores, and individual class probabilities back to CSV.

### 3. Model Transparency & Validation Dashboard
- Direct visualization of test set performance ($N=780$ holdout):
  - **Overall Test Accuracy**: $81.03\%$
  - **Macro F1 Score**: $81.15\%$
  - **Per-Class Breakdown**: Healthy F1 ($80.4\%$), Subclinical F1 ($75.3\%$), Clinical F1 ($87.8\%$).
- **Feature Importance Chart**: Demonstrating that direct milk biomarkers account for $>91\%$ of diagnostic power ($\text{SCC}: 50.7\%$, $\text{EC}: 22.6\%$, $\text{pH}: 18.1\%$).
- **Confusion Matrix Grid**: Interactive display of true vs predicted classifications.
- **Methodology Documentation**: Explaining the Cholesky correlation matrix preservation ($R = L L^T$) and realistic within-herd biological noise calibration (Noise $\times 18.0$).

---

## Quick Start Guide

### Option A: One-Command Startup (Recommended)
Launch both the backend and frontend simultaneously with the provided script:
```bash
./run_app.sh
```
Open your browser to:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

### Option B: Manual Startup

#### 1. Start the FastAPI Backend
```bash
# Install backend dependencies (if not already installed)
python3 -m pip install -r backend/requirements.txt

# Start Uvicorn server
python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend will be live at `http://127.0.0.1:8000`.

#### 2. Start the React Frontend
```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start Vite dev server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

*Note: The FastAPI backend also serves the built static frontend directly at `http://127.0.0.1:8000/`.*

---

## API Reference

### Health Check
`GET /health`
```json
{
  "status": "healthy",
  "service": "Bovine Mastitis Diagnostic API",
  "model_loaded": true,
  "model_name": "Random Forest",
  "test_accuracy": 0.8102564102564103,
  "classes": ["Healthy", "Subclinical", "Clinical"]
}
```

### Single Cow Prediction
`POST /predict`
```json
{
  "pH": 6.80,
  "EC": 5.10,
  "SCC": 3.60,
  "Season": "Rainy",
  "LactationStage": "Mid",
  "Parity": "3rd",
  "MilkYield": "5-10"
}
```
**Response**:
```json
{
  "predicted_stage": "Subclinical",
  "predicted_class_index": 1,
  "confidence": 0.4721,
  "probabilities": {
    "Healthy": 0.4545,
    "Subclinical": 0.4721,
    "Clinical": 0.0734
  },
  "biomarkers": {
    "SCC": { "value": 3.6, "unit": "×10⁵ cells/mL", "status": "Elevated (Subclinical range)", "severity": "medium", "reference": "< 2.0" },
    "EC": { "value": 5.1, "unit": "mS/cm", "status": "Elevated", "severity": "medium", "reference": "4.0 - 4.8" },
    "pH": { "value": 6.8, "unit": "pH", "status": "Slightly Alkaline", "severity": "medium", "reference": "6.4 - 6.7" }
  },
  "clinical_explanation": "Subclinical mastitis detected (47.2% confidence). The prediction is predominantly driven by moderately elevated Somatic Cell Count...",
  "veterinary_recommendation": "Conduct a California Mastitis Test (CMT) on all four individual quarters to identify the specific infected quarter...",
  "action_code": "INSPECT_CMT",
  "color_theme": "amber"
}
```

### Batch CSV Upload
`POST /predict/upload-csv`
Uploads a `.csv` file with multipart form-data.

### Model Metrics
`GET /metrics`
Returns test accuracy, per-class metrics, confusion matrix, and feature importances.

---

## Testing & Quality Assurance

Run the automated backend test suite:
```bash
python3 backend/test_backend.py
```
Outputs:
```
✓ Health endpoint passed
✓ Predict Healthy passed
✓ Predict Subclinical passed
✓ Predict Clinical passed
✓ Validation error handling passed
✓ Batch prediction passed
✓ Metrics endpoint passed

🎉 ALL BACKEND TESTS PASSED SUCCESSFULLY!
```

---

## Veterinary Disclaimer

> [!CAUTION]
> **Synthetic Cohort Limitation**: This classification engine was trained on a synthetic dataset mathematically reconstructed from published group summary statistics (mean $\pm$ SD) with calibrated within-herd variance (Noise $\times 18.0$). It is designed as an algorithmic decision-support tool and educational demonstration. Clinical decisions in active dairy operations must be confirmed through on-farm diagnostic methods (e.g. California Mastitis Test, microbiological culture, somatic cell counters) and evaluated by a certified veterinary professional.
