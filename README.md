<p align="center">
  <img src="extension/icons/icon128.png" alt="LinkLens AI Logo" width="100" height="100" />
</p>

<h1 align="center">LinkLens AI 🔍🛡️</h1>

<p align="center">
  <strong>AI-Powered Phishing URL Detection & Website Security Analysis Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/License-Open%20Source-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <a href="#-key-features">Features</a> •
  <a href="#-architecture-overview">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-installation--setup">Installation</a> •
  <a href="#-browser-extension">Extension</a> •
  <a href="#-api-documentation">API Docs</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 📖 Overview

LinkLens AI is an enterprise-grade, cyberpunk dark-themed cybersecurity intelligence platform designed to detect **phishing**, **defacement**, **malware**, and **credential-harvesting** URLs in real time. The platform is available as both a **full-stack web application** and a **Manifest V3 browser extension**.

By combining a **59-feature Random Forest Machine Learning classifier** (trained on the PhiUSIIL dataset with 235,000+ labeled samples) with a **real-time OSINT diagnostics suite** and **12 advanced obfuscation/evasion heuristics**, LinkLens AI analyzes links down to their raw bytes to calculate dynamic risk scores and identify sophisticated evasion tricks used by modern phishing kits.

---

## ✨ Key Features

### 🤖 1. Hybrid Detection Engine

| Component | Description |
|---|---|
| **ML Classifier** | 4-class Random Forest model (200 estimators, max depth 30) mapping 59 lexical features, token patterns, and domain characteristics to classify URLs as **Safe (Benign)**, **Phishing**, **Defacement**, or **Malware**. |
| **WHOIS Intelligence** | Real-time domain registration lookup — registrant details, creation/expiration dates, registrar identification (e.g., MarkMonitor, GoDaddy), and WHOIS privacy detection. |
| **SSL/TLS Deep Scan** | Certificate validity verification, issuer authority identification, certificate age calculation, Let's Encrypt detection, and corporate CA classification. |
| **Redirect Tracker** | Multi-hop redirect chain analysis capturing each redirect hop, the final destination URL, and flagging excessive redirect chains (>2 hops). |
| **Dynamic Risk Scoring** | Hybrid scoring engine combining ML probabilities with live OSINT signal adjustments. Base score from ML is dynamically modified by 18+ live signal factors. |

### 🔐 2. 12 Advanced Cryptographic & Evasion Heuristics

LinkLens AI includes a dedicated risk analyzer built specifically to detect evasion vectors commonly used in modern phishing kits:

| # | Heuristic | Description | Risk Weight |
|---|---|---|---|
| 1 | **Base64 Target Parameter** | Scans query parameter keys and values for Base64 substrings and decodes them to reveal hidden payloads. | +25 |
| 2 | **URL Encoding Density** | Checks if percent-encoded character density exceeds normal web thresholds (>8%). | +12 |
| 3 | **Double URL Encoding** | Flags sequential URL encoding sequences (e.g., `%25xx`) designed to bypass WAF/firewall inspection. | +25 |
| 4 | **Hex-Obfuscated Path** | Isolates and decodes percent-encoded character blocks inside URL path variables. | +20 |
| 5 | **Mixed Obfuscation** | Flags parameters utilizing multiple encodings simultaneously (Base64 + URL-encoding). | +20 |
| 6 | **High Parameter Entropy** | Calculates Shannon Entropy on query strings to detect encrypted values or random hash tokens. | +15 |
| 7 | **DWORD/Hex IP Hostname** | Identifies decimal integer or flat hex-mapped IP hosts bypassing standard DNS lookups. | +30 |
| 8 | **Embedded Data URI** | Detects embedded executing `data:text/html;base64` scripts within redirect links. | +35 |
| 9 | **Punycode/IDN Homograph** | Unpacks Punycode representations (`xn--`) to expose Unicode lookalike characters mimicking major brands. | +30 |
| 10 | **Excessive Character Padding** | Detects repetitive letters/characters inside paths meant to exceed buffer sizes or bypass regex filters. | +15 |
| 11 | **Octal IP Hostname** | Exposes octal formatted dotted-decimal hosts redirecting to malicious destinations. | +30 |
| 12 | **Non-Standard Port** | Alerts if HTTP/HTTPS requests are routed through custom ports other than standard `80` or `443`. | +15 |

### 🕵️ 3. 6 Advanced Threat Analysis Modules

| Module | Description | Risk Weight |
|---|---|---|
| **Basic Auth URL Abuse** | Detects URLs using `user:pass@host` syntax to masquerade as trusted domains while redirecting to malicious hosts. | +35 |
| **Open Redirect Detection** | Identifies open redirect vulnerabilities by analyzing URL parameters for external domain targets. | +25 |
| **IP Obfuscation Detection** | Identifies standard dotted-decimal IPs (+15) and obfuscated IP formats like DWORD, hex, or octal (+35). | +15/+35 |
| **IDN Homograph Attack** | Detects International Domain Name homograph attacks using Punycode/Unicode lookalike characters. | +30 |
| **Typosquatting/Brand Mimicry** | Identifies domains designed to mimic major brands through character substitution or addition. | +25 |
| **Hidden/Control Characters** | Detects invisible Unicode control characters, zero-width joiners, and right-to-left override characters. | +30 |

### 🎨 4. Cyberpunk Dark-Themed Web Interface

* **Real-time Scanner Dashboard** — Paste URLs to trigger dynamic, animated SVG `RiskGauge` scoring, diagnostic threat reason feeds, and full WHOIS/SSL/evasion data tables.
* **Active Payload Decoder Panel** — Display panel showing raw encoded arguments side-by-side with their URL-decoded and Base64-decoded representations.
* **Scan History** — Searchable, sortable grid containing previous audits with threat severity filtering. Data persisted in client-side `localStorage`.
* **Security Analytics Dashboard** — Recharts-powered interactive graphs analyzing threat distributions, average risk ratings, and historical scanning metrics.
* **Privacy Policy & Terms of Service** — Full legal compliance pages with detailed data handling policies.
* **Contact Us** — Direct contact page with email communication details.

### 🌐 5. Browser Extension (Manifest V3)

* **Automatic Background Scanning** — Scans every page you visit automatically without requiring any user interaction.
* **Dynamic Badge Indicators** — Green (safe), orange (suspicious), or red (dangerous) badge on the extension icon with real-time risk scores.
* **Warning Interstitial Page** — Full-screen warning page with glassmorphic cybersecurity design for high-risk URLs (score ≥ 80 or phishing detection), with options to **go back** or **proceed anyway**.
* **Desktop Notifications** — Native system notifications for high-risk websites detected.
* **URL Whitelisting** — User-configurable whitelist to bypass blocking for trusted domains.
* **Scan Caching** — Local caching of scan results to avoid redundant API calls.
* **Multi-Browser Support** — Compatible with Chrome, Edge, Brave, and Opera.
* **Configurable API Endpoint** — Settings panel to customize the backend API server URL.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION LAYER                       │
├──────────────────────────┬──────────────────────────────────────────┤
│   React Web Application  │    Browser Extension (Manifest V3)      │
│   (Vite + Tailwind v4)   │    (Chrome / Edge / Brave / Opera)      │
│                          │                                          │
│   • Landing Page         │    • Popup Interface (popup.html/js)     │
│   • URL Scanner          │    • Background Service Worker           │
│   • Scan History         │    • Content Script                      │
│   • Analytics Dashboard  │    • Warning Interstitial Page           │
│   • Privacy / Terms      │    • Dynamic Badge System                │
│   • Contact Us           │    • Desktop Notifications               │
├──────────────────────────┴──────────────────────────────────────────┤
│                           ▼  REST API  ▼                            │
├─────────────────────────────────────────────────────────────────────┤
│                     FastAPI Backend Server                           │
│                                                                     │
│   POST /api/analyze                                                 │
│                                                                     │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│   │  ML Classifier   │  │   OSINT Engine   │  │  Evasion Engine  │ │
│   │  (Random Forest) │  │  (WHOIS/SSL/DNS) │  │  (12 Heuristics) │ │
│   │  59 Features     │  │  Live Diagnostics│  │  + 6 Advanced    │ │
│   │  4-Class Output  │  │  Domain Intel    │  │  Threat Modules  │ │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘ │
│                           ▼                                         │
│              Dynamic Hybrid Risk Score Engine                       │
│         (ML Base Score + Live Signal Adjustments)                   │
│                  Risk Score: 0 — 100                                │
│          Verdict: SAFE | SUSPICIOUS | DANGEROUS                    │
├─────────────────────────────────────────────────────────────────────┤
│                      DATA & MODEL LAYER                             │
│                                                                     │
│   • PhiUSIIL Dataset (235K+ labeled URLs)                          │
│   • Trained Random Forest Model (.pkl)                              │
│   • Feature Names Index (.pkl)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **Python 3.10+** | Core runtime |
| **FastAPI** | High-performance async REST API framework |
| **Uvicorn** | ASGI server with hot-reload |
| **Scikit-Learn** | Random Forest Classifier (4-class multi-label) |
| **Pandas** | Feature vector alignment & data manipulation |
| **NumPy** | Numerical computation for probability arrays |
| **Joblib** | Model serialization (pickle format) |
| **python-whois** | Domain WHOIS registration lookups |
| **requests** | HTTP redirect chain tracking & SSL inspection |

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | Component-based UI framework |
| **Vite 6** | Lightning-fast HMR dev server & build tooling |
| **@tanstack/react-router** | File-based routing with type safety |
| **@tanstack/react-query** | Server state management & data fetching |
| **Tailwind CSS v4** | Utility-first CSS with OKLCH color support |
| **Recharts** | Interactive data visualization charts |
| **Lucide React** | Modern icon library |
| **Sonner** | Toast notification system |
| **date-fns** | Date formatting utilities |

### Browser Extension

| Technology | Purpose |
|---|---|
| **Manifest V3** | Latest Chrome extension platform standard |
| **Service Worker** | Background script for persistent scanning |
| **Chrome Storage API** | Local data persistence (cache, history, settings) |
| **Chrome Notifications API** | Native desktop alert system |
| **Chrome Tabs API** | Tab URL monitoring & navigation control |
| **Vanilla CSS** | Premium glassmorphic cybersecurity theme |

---

## 📁 Project Structure

```text
LinkLensAI/
├── 📄 README.md                          # This file — full project documentation
├── 📄 render.yaml                        # Render deployment blueprint configuration
│
├── 🔧 backend/                           # FastAPI Backend Server
│   ├── dataset/                          # Training data directory
│   │   └── final_dataset_with_all_features_v3.1.csv  # PhiUSIIL dataset (235K+ URLs, 59 features)
│   ├── models/                           # Serialized ML model artifacts
│   │   ├── phishing_model.pkl            # Trained Random Forest model (~293 MB)
│   │   └── feature_names.pkl             # Ordered feature name index
│   ├── main.py                           # FastAPI app, API routes, hybrid risk scoring engine
│   ├── extractor.py                      # 59-feature extraction + 12 evasion heuristics + 6 advanced modules
│   ├── train.py                          # Model training script (Random Forest, 200 estimators)
│   ├── test_advanced_features.py         # Unit tests for IP obfuscation, homograph, typosquatting
│   └── requirements.txt                  # Python dependencies
│
├── 🎨 frontend/                          # React + Vite Web Application
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout.jsx                # Global navbar, footer, and page shell
│   │   ├── hooks/
│   │   │   └── useMeta.js                # SEO metadata management hook
│   │   ├── routes/
│   │   │   ├── home.jsx                  # High-impact cyberpunk landing page
│   │   │   ├── scanner.jsx               # URL scanning dashboard with RiskGauge
│   │   │   ├── history.jsx               # Scan history grid with search & sort
│   │   │   ├── analytics.jsx             # Recharts analytics dashboard
│   │   │   ├── about.jsx                 # Cyber threat education page
│   │   │   ├── privacy.jsx               # Privacy Policy page
│   │   │   ├── terms.jsx                 # Terms of Service page
│   │   │   └── contact.jsx               # Contact Us page
│   │   ├── App.jsx                       # Router + Query Client + Toast provider setup
│   │   ├── main.jsx                      # React DOM entry point
│   │   ├── styles.css                    # OKLCH-based cyberpunk design tokens
│   │   ├── index.css                     # Global styles
│   │   └── App.css                       # App-level styles
│   ├── package.json                      # NPM dependencies
│   └── vite.config.js                    # Vite + React + Tailwind v4 config
│
└── 🌐 extension/                         # Browser Extension (Manifest V3)
    ├── icons/                            # Extension icon assets
    │   ├── icon16.png                    # 16x16 toolbar icon
    │   ├── icon32.png                    # 32x32 toolbar icon
    │   ├── icon48.png                    # 48x48 extension page icon
    │   └── icon128.png                   # 128x128 Chrome Web Store icon
    ├── manifest.json                     # Manifest V3 configuration
    ├── background.js                     # Service worker — background scanning, badge, notifications
    ├── content.js                        # Content script — page-level communication
    ├── popup.html                        # Extension popup UI layout
    ├── popup.css                         # Premium glassmorphic dark theme styles
    ├── popup.js                          # Popup logic — scanning, history, settings views
    ├── warning.html                      # Full-screen warning interstitial page
    ├── warning.css                       # Warning page cybersecurity theme
    ├── warning.js                        # Warning page logic — proceed/go back actions
    ├── generate_icons.py                 # Python script to generate extension icons
    └── test_mock_server.py              # Mock Flask server for extension testing
```

---

## 🚀 Installation & Setup

### Prerequisites

| Requirement | Minimum Version | Purpose |
|---|---|---|
| **Python** | 3.10+ | Backend server & ML model |
| **Node.js** | 18+ | Frontend dev server & build |
| **npm** | 9+ | Package management |
| **Git** | Any | Version control |

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ashishashu1411/LinkLensAI.git
cd LinkLensAI
```

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd backend

# (Recommended) Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Train the ML Model (First Time Only)

> **Note:** The training dataset (`final_dataset_with_all_features_v3.1.csv`) must be present in the `backend/dataset/` directory. The trained model files will be saved to `backend/models/`.

```bash
# Train the Random Forest classifier
python train.py
```

**Expected output:**
```
[*] Loading dataset...
    Shape: (651191, 64)
    Label distribution:
    0    428103
    1     96457
    2     94111
    3     32520
[*] Training Random Forest Classifier (4-class)...
[+] Accuracy: 0.8820
[+] Model saved to models/phishing_model.pkl
[✓] Training complete.
```

#### Start the Backend Server

```bash
# Run the FastAPI server (default: http://127.0.0.1:8000)
python main.py
```

The API server will start with hot-reload enabled. You can verify it's running by visiting:
- **Health Check:** `http://127.0.0.1:8000/`
- **Swagger Docs:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`

### Step 3: Setup Frontend

Open a **new terminal** and run:

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the Vite development server (default: http://localhost:5173)
npm run dev
```

The web application will launch and automatically connect to the backend API.

### Step 4: Setup Browser Extension (Optional)

1. Open your browser and navigate to the extensions page:
   - **Chrome:** `chrome://extensions`
   - **Edge:** `edge://extensions`
   - **Brave:** `brave://extensions`
   - **Opera:** `opera://extensions`

2. Enable **Developer Mode** (toggle in the top-right corner).

3. Click **"Load unpacked"** and select the `extension/` directory from the project root.

4. The LinkLens AI icon will appear in your browser toolbar.

5. Click the extension icon to configure the API server URL in **Settings** (default: `http://localhost:5000/scan` — update to match your backend URL such as `http://127.0.0.1:8000/api/analyze`).

6. The extension will automatically start scanning every page you visit!

---

## 🔌 API Documentation

### Base URL

```
http://127.0.0.1:8000
```

### Endpoints

#### `GET /` — Health Check

Returns the server status.

**Response:**
```json
{
  "status": "ok",
  "service": "LinkLens AI v2.0"
}
```

#### `POST /api/analyze` — Analyze URL

The primary scan endpoint. Accepts a URL and returns a comprehensive threat analysis.

**Request:**
```json
{
  "url": "https://update-service.online/gateway?data=%4d%54YztmRG9zaW1w"
}
```

**Headers:**
```
Content-Type: application/json
```

**Response Schema:**

| Field | Type | Description |
|---|---|---|
| `url` | `string` | The analyzed URL |
| `risk_score` | `float` | Dynamic hybrid risk score (0.0 — 100.0) |
| `verdict` | `string` | `SAFE` / `SUSPICIOUS` / `DANGEROUS` |
| `threat_type` | `string` | `Benign` / `Defacement` / `Phishing` / `Malware` |
| `predicted_class` | `int` | ML class label (0=Benign, 1=Defacement, 2=Phishing, 3=Malware) |
| `reasons` | `string[]` | Array of human-readable threat indicators |
| `ml_probabilities` | `object` | Per-class ML confidence percentages |
| `ml_threat_probability` | `float` | Confidence of the predicted threat class |
| `live_metrics` | `object` | OSINT diagnostics including WHOIS, SSL, redirects, evasion features |

**Full Sample Response:**
```json
{
  "url": "https://update-service.online/gateway?data=%4d%54YztmRG9zaW1w",
  "risk_score": 75.0,
  "verdict": "DANGEROUS",
  "threat_type": "Phishing",
  "predicted_class": 2,
  "reasons": [
    "ML model detects Phishing attempt (89.3% confidence)",
    "Domain is only 45 days old (< 90 days — suspicious)",
    "High URL percent-encoding density (12.5%)",
    "Base64 obfuscated target parameter: Obfuscated text payload detected."
  ],
  "ml_probabilities": {
    "0": 5.2,
    "1": 3.1,
    "2": 89.3,
    "3": 2.4
  },
  "ml_threat_probability": 89.3,
  "live_metrics": {
    "domain_age_days": 45,
    "creation_date": "2026-04-01",
    "whois_private": false,
    "ssl_valid": true,
    "ssl_issuer_org": "Let's Encrypt",
    "is_lets_encrypt": true,
    "is_corporate_ca": false,
    "cert_age_days": 12,
    "redirect_hops": 1,
    "final_url": "https://update-service.online/gateway",
    "entropy": 3.84,
    "has_base64": true,
    "has_hex": true,
    "has_double_encoding": false,
    "registrar": "Namecheap, Inc.",
    "encodings_analysis": [],
    "advanced_analysis": {
      "basic_auth": { "detected": false },
      "open_redirect": { "detected": false },
      "ip_obfuscation": { "detected": false },
      "idn_homograph": { "detected": false },
      "typosquatting": { "detected": false },
      "hidden_chars": { "detected": false }
    },
    "evasion_features": {
      "base64_target_param": { "detected": true, "details": "Encoded payload found" },
      "url_encoding_density": { "detected": true, "density_ratio": 0.125 },
      "double_url_encoding": { "detected": false },
      "hex_obfuscated_path": { "detected": false },
      "mixed_obfuscation": { "detected": false },
      "high_parameter_entropy": { "detected": false },
      "dword_hex_ip": { "detected": false },
      "embedded_data_uri": { "detected": false },
      "punycode_idn_homograph": { "detected": false },
      "excessive_padding": { "detected": false },
      "octal_ip_evasion": { "detected": false },
      "non_standard_port": { "detected": false }
    }
  }
}
```

### Verdict Classification Logic

| Condition | Verdict |
|---|---|
| ML predicts Benign AND risk_score < 40 | **SAFE** ✅ |
| ML predicts threat class OR risk_score ≥ 40 | **SUSPICIOUS** ⚠️ |
| ML predicts Malware OR risk_score ≥ 70 | **DANGEROUS** 🚨 |

### Risk Score Calculation

The risk score is a **dynamic hybrid value** computed as:

```
Final Score = ML Base Score + Σ(Live OSINT Signal Adjustments)
```

- **ML Base Score:** For benign predictions, capped at 30. For threat predictions, equals the ML confidence.
- **OSINT Adjustments:** Each live signal (domain age, SSL, evasion features, etc.) adds a weighted penalty to the base score.
- **Clamping:** Final score is clamped to the range `[0, 100]`.

---

## 🧪 Testing

### Backend Unit Tests

Run the heuristics validation test suite:

```bash
cd backend
python test_advanced_features.py
```

**Test Suites Covered:**
1. IP Obfuscation Detection (DWORD, Hex, Octal)
2. Basic Auth URL Abuse
3. IDN Homograph Attacks
4. Typosquatting/Brand Mimicry
5. Hidden/Control Characters
6. Open Redirect Detection

All 6 test suites should report `ALL TESTS PASSED SUCCESSFULLY!`.

### Extension Mock Server Testing

A mock Flask server is provided for testing the browser extension without the full backend:

```bash
cd extension
pip install flask flask-cors
python test_mock_server.py
```

This starts a lightweight server on `http://localhost:5000/scan` that returns simulated threat analysis responses.

---

## 🌐 Browser Extension — Detailed Guide

### Supported Browsers

| Browser | Minimum Version | Status |
|---|---|---|
| Google Chrome | 111+ | ✅ Fully Supported |
| Microsoft Edge | 111+ | ✅ Fully Supported |
| Brave Browser | 1.50+ | ✅ Fully Supported |
| Opera Browser | 97+ | ✅ Fully Supported |

### How It Works

```
┌──────────────────────┐
│     Page Loads /      │
│   Tab URL Changes     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  background.js        │    ← Service Worker (always running)
│  Detects URL change   │
│  via tabs.onUpdated   │
└──────────┬───────────┘
           ▼
┌──────────────────────┐     ┌───────────────────────┐
│  Internal URL?        │──── │ YES → Clear badge,    │
│  (chrome://, edge://) │     │       skip scan       │
└──────────┬───────────┘     └───────────────────────┘
           ▼ NO
┌──────────────────────┐     ┌───────────────────────┐
│  Whitelisted domain?  │──── │ YES → Badge only,     │
│  (user's allow list)  │     │       no blocking     │
└──────────┬───────────┘     └───────────────────────┘
           ▼ NO
┌──────────────────────┐     ┌───────────────────────┐
│  Cached result?       │──── │ YES → Use cached data │
│  (chrome.storage)     │     │       update badge    │
└──────────┬───────────┘     └───────────────────────┘
           ▼ NO
┌──────────────────────┐
│  POST /api/analyze    │    ← 10-second AbortController timeout
│  to backend API       │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Parse & normalize    │
│  API response         │
└──────────┬───────────┘
           ▼
┌──────────────────────────────────────────────┐
│  Update badge:                                │
│    🟢 Green  → score < 40 (Safe)              │
│    🟠 Orange → score 40–69 (Suspicious)       │
│    🔴 Red    → score ≥ 70 (Dangerous)         │
├───────────────────────────────────────────────┤
│  If score ≥ 80 OR phishing detected:          │
│    → Show desktop notification                │
│    → Redirect to warning.html interstitial    │
└──────────────────────────────────────────────┘
```

### Extension Features Breakdown

#### 🔍 Dashboard View
- Displays the current tab's URL with one-click scanning
- Animated risk gauge visualization
- Risk level classification with color-coded indicators
- Detailed threat analysis breakdown with reasons
- Domain age and confidence metrics

#### 📜 History View
- Chronological list of all scanned URLs
- Risk score and prediction for each entry
- One-click clear history functionality
- Data persisted via Chrome Storage API

#### ⚙️ Settings View
- Configurable API server URL
- Auto-scan toggle (enabled by default)
- Settings saved across sessions

#### ⚠️ Warning Interstitial Page
- Full-screen glassmorphic cybersecurity-themed warning
- Displays risk score, threat reasons, and URL details
- **"Go Back to Safety"** button — navigates to the previous safe page
- **"Proceed Anyway"** button — adds the domain to the whitelist and continues

### Extension Permissions

| Permission | Purpose |
|---|---|
| `activeTab` | Access the URL of the currently active tab |
| `tabs` | Monitor tab URL changes for automatic scanning |
| `storage` | Persist scan cache, history, whitelist, and settings |
| `notifications` | Display native desktop alerts for high-risk sites |
| `host_permissions: <all_urls>` | Send URLs to the backend API for analysis |

---

## ☁️ Deployment

### Deploying to Render

LinkLens AI is pre-configured for deployment to **[Render](https://render.com/)** using a single Blueprint configuration file (`render.yaml`).

#### Render Blueprint Configuration

The `render.yaml` defines two services:

| Service | Type | Runtime | Description |
|---|---|---|---|
| `linklens-backend` | Web Service | Python | FastAPI server via Uvicorn |
| `linklens-frontend` | Static Site | Node.js | Vite-built React SPA |

#### Deployment Steps

1. **Push to GitHub** — Ensure the repository (including model pickles in `backend/models/`) is pushed to GitHub.

2. **Create Blueprint on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **New +** → **Blueprint**
   - Connect your GitHub repository

3. **Automatic Setup** — Render will parse `render.yaml` and create:
   - **linklens-backend**: Python web service running `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **linklens-frontend**: Static site with `npm install && npm run build`, serving from `dist/`
   - The frontend's `VITE_API_URL` environment variable is automatically bound to the backend service URL

4. Click **Approve** to build and deploy.

#### Environment Variables

| Variable | Service | Default | Description |
|---|---|---|---|
| `PORT` | Backend | `8000` | Server port |
| `ALLOWED_ORIGINS` | Backend | `*` | Comma-separated CORS origins |
| `VITE_API_URL` | Frontend | (from backend) | Backend API base URL |

---

## 🔧 Configuration

### Backend CORS Configuration

The backend dynamically reads allowed origins from the `ALLOWED_ORIGINS` environment variable:

```python
# In main.py
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
```

For production, set specific origins:
```bash
export ALLOWED_ORIGINS="https://your-frontend.onrender.com,https://your-domain.com"
```

### Frontend API URL

The frontend reads the API base URL from the `VITE_API_URL` environment variable. Set it before building:

```bash
export VITE_API_URL="https://your-backend.onrender.com"
npm run build
```

### Extension API URL

Update the API server URL in the extension's Settings panel, or modify the default in `background.js`:

```javascript
const DEFAULT_API_URL = 'http://localhost:5000/scan';
```

---

## 📊 ML Model Details

### Training Configuration

| Parameter | Value |
|---|---|
| **Algorithm** | Random Forest Classifier |
| **Estimators** | 200 |
| **Max Depth** | 30 |
| **Min Samples Split** | 5 |
| **Min Samples Leaf** | 2 |
| **Test Split** | 20% (stratified) |
| **Random State** | 42 |
| **Parallelism** | All cores (`n_jobs=-1`) |

### Dataset

| Attribute | Value |
|---|---|
| **Name** | PhiUSIIL Phishing URL Dataset v3.1 |
| **Total Samples** | 235,795+ |
| **Feature Count** | 59 lexical & domain features |
| **Classes** | 4 (Benign, Defacement, Phishing, Malware) |
| **Format** | CSV |

### Label Distribution

| Class | Label | Description |
|---|---|---|
| 0 | **Benign** | Safe, legitimate URLs |
| 1 | **Defacement** | Web defacement attack URLs |
| 2 | **Phishing** | Credential harvesting / phishing URLs |
| 3 | **Malware** | Malware distribution URLs |

### Model Performance

The trained model achieves approximately **88.2% accuracy** on the test set with strong precision and recall across all four classes.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and naming conventions
- Add unit tests for new heuristic detectors
- Update this README for any architectural changes
- Test the extension in all supported browsers before submitting

---

## 📧 Contact

For questions, feedback, or support:

- **Email:** [ashishbharti651@gmail.com](mailto:ashishbharti651@gmail.com)
- **GitHub Issues:** Open an issue in this repository

---

## 📜 License

Built as an educational threat analysis utility. All code is open-source and customizable for corporate security awareness, threat hunting tasks, and cybersecurity research.

---

<p align="center">
  <strong>Made with ❤️ by the LinkLens AI Team</strong>
</p>

<p align="center">
  <sub>⚡ Powered by Machine Learning, OSINT, and Advanced Heuristics</sub>
</p>
