# 🐄 GauRakshak AI — Frontend Web Application
### *Smart Bovine Mastitis Early Warning & Dairy Herd Health Platform*

<div align="center">

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2.11-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.12.7-22c55e)](https://recharts.org/)
[![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-0.344.0-f97316)](https://lucide.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

*A modern, farmer-friendly, high-performance web dashboard engineered to deliver real-time bovine mastitis risk assessments, herd tracking, and voice-assisted clinical recommendations.*

[**Explore Live Dashboard**](#-features--modules) • [**Getting Started**](#-quick-start) • [**Architecture**](#-architecture--folder-structure) • [**Backend Integration**](#-backend-api-integration)

</div>

---

## 📖 Overview

**GauRakshak AI Frontend** is the user interface for the GauRakshak AI ecosystem. It bridges advanced predictive veterinary machine learning models with real-world dairy farm operations. Built with **React 18**, **Tailwind CSS**, and **Vite**, the application provides rapid, responsive, and intuitive insights for both dairy farmers in rural setups and large-scale commercial dairy managers.

---

## ✨ Features & Modules

### 1. 🧪 Single Cow Clinical Mastitis Diagnostic
- Input multi-parameter diagnostic indicators:
  - **Somatic Cell Count (SCC)** (cells/mL)
  - **Milk Electrical Conductivity (EC)** (mS/cm)
  - **Milk Yield** (Liters/day)
  - **Milk Temperature & Body Temperature** (°C)
  - **Milk pH, Protein %, Fat %, Lactose %**
  - **Udder Swelling, Firmness & Teat Redness** (Clinical scale)
  - **Parity, Lactation Stage & Past Mastitis History**
- Real-time risk scoring (**Low / Subclinical / Clinical Mastitis**) with confidence percentages.
- Interactive **4-Quarter Udder Status Visualizer** (Front Left, Front Right, Rear Left, Rear Right).
- Instant, actionable veterinary clinical care recommendations and isolation protocols.

### 2. 🏷️ RFID / Smart Ear-Tag Instant Scanner
- Simulates automated IoT / RFID ear-tag reader workflows at parlor entry.
- Pre-loads actual cow physiological telemetry with a single click or tag scan.
- Instant model inference without manual manual form input.

### 3. 📋 My Cows & Health Record History
- Complete dairy herd directory with search and filter capabilities (Tag ID, Breed, Status, Lactation Stage).
- Individual cow history log with timestamped diagnostic runs, SCC trends, and risk changes.
- In-depth **Cow Health Profile Modal** displaying lifetime telemetry, quarter health, and vet notes.

### 4. 🎙️ Farmer Audio Help Guide (Bilingual: English & Hindi)
- Native voice synthesis using the **Web Speech API** (`SpeechSynthesis`).
- Farmers can click to listen to easy-to-understand explanations of:
  - Early symptoms of subclinical mastitis.
  - Correct California Mastitis Test (CMT) testing technique.
  - Pre-milking and post-milking teat dipping hygiene.
  - Emergency veterinary contacts and antibiotic stewardship guidelines.

### 5. 📊 Model Performance & Clinical Transparency
- Complete breakdown of the 6 trained ML classifiers:
  - **CatBoost** (99.71% Accuracy, 0.9999 ROC-AUC)
  - **XGBoost** (99.57% Accuracy, 0.9998 ROC-AUC)
  - **LightGBM** (99.57% Accuracy, 0.9997 ROC-AUC)
  - **Random Forest**, **Gradient Boosting**, and **Extra Trees**
- Interactive ROC Curves, Feature Importance charts, and Confusion Matrix metrics.

### 6. 🔔 Real-time Alerts & Notifications
- Persistent notification bell with unread badge count.
- Dynamic critical warnings when herd members exhibit high somatic cell counts or high risk flags.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) (Hooks, Functional Components, Context API)
- **Build Tool**: [Vite 5](https://vitejs.dev/) (Instant HMR, fast bundling)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/) with `@tailwindcss/forms`
- **Charts & Graphs**: [Recharts](https://recharts.org/) (ResponsiveContainer, BarChart, LineChart, AreaChart)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Voice Synthesis**: Browser Native Web Speech API
- **HTTP Communication**: Native Fetch API / REST integration with FastAPI backend

---

## 📂 Architecture & Folder Structure

```text
frontend/
├── public/
│   └── cow_holstein.jpg         # Asset & high-res portrait illustrations
├── src/
│   ├── components/
│   │   ├── DashboardView.jsx        # Herd dashboard, metrics cards, quick actions
│   │   ├── SingleDiagnosis.jsx      # Diagnostic input console & prediction result
│   │   ├── RfidPredictionFlow.jsx   # RFID tag scanner simulation
│   │   ├── CowProfileView.jsx       # Herd table & detailed cow modal
│   │   ├── HistoryAndGuideView.jsx  # Unified history and farmer guide wrapper
│   │   ├── FarmerHelpGuide.jsx      # Bilingual voice-enabled guidance
│   │   ├── ModelMetrics.jsx         # Clinical ML benchmark charts & specs
│   │   ├── TopBar.jsx               # Navigation bar, language switcher, notifications
│   │   ├── Sidebar.jsx              # Navigation drawer
│   │   ├── UdderHealthCard.jsx      # 4-Quarter interactive udder visualizer
│   │   ├── LandingPage.jsx          # Public landing presentation
│   │   ├── Header.jsx / Footer.jsx  # Layout elements
│   │   └── ErrorBoundary.jsx        # UI crash isolation boundary
│   ├── App.jsx                      # Root application & state router
│   ├── constants.js                 # Default thresholds, sample herd data, model specs
│   ├── translations.js              # English & Hindi translation dictionaries
│   ├── index.css                    # Tailwind utility and global styling
│   └── main.jsx                     # Vite entry point
├── index.html                       # HTML document wrapper
├── package.json                     # Dependencies and scripts
├── tailwind.config.js               # Tailwind design system tokens
└── vite.config.js                   # Vite configuration
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

### 1. Clone the Repository
```bash
git clone https://github.com/Satyam-0318/GauRakshak-AI-Frontend.git
cd GauRakshak-AI-Frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🔌 Backend API Integration

The frontend connects to the **GauRakshak AI FastAPI Backend**:

- **Default API URL**: `http://127.0.0.1:8000`
- **Key Endpoints**:
  - `POST /predict`: Single cow risk evaluation with ensemble machine learning.
  - `GET /history`: Fetch stored herd test histories and diagnostic logs.
  - `GET /metrics`: Fetch model benchmark metrics and feature importance.
  - `GET /cows`: Retrieve saved herd cow profiles.

> If running without the backend server, the frontend includes intelligent fallback mock simulators so all UI features, RFID scanning, and voice guides remain interactive.

---

## 🌐 Bilingual Support (English / हिन्दी)

Farmers can toggle between **English** and **हिन्दी** directly from the top navigation bar. All diagnostic labels, severity badges, and voice readouts adapt to the chosen language.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  <b>GauRakshak AI</b> — Protecting Dairy Herd Health with Machine Intelligence 🐄🌾
</div>
