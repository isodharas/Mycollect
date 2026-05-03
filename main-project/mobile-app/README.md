# MyCollect 🗑️
### AI-Powered IoT Waste Management with Health-Responsive Routing

> Final Year Project — BSc (Hons) Software Engineering  
> NSBM Green University | University of Plymouth  
> Student: Dinithi Isodhara Wijesinghe | Index: 10952811  
> Supervisor: Miss. Dharani Rajasinghe

---

## 🧠 What is MyCollect?

Sri Lanka generates over **7,000 metric tons of municipal solid waste daily**. Yet collection trucks follow fixed schedules — completely ignoring what's actually happening on the ground.

In Sri Lanka's tropical climate (27°C, 75% humidity), organic waste begins anaerobic decomposition within **36–48 hours**, releasing methane, ammonia, and hydrogen sulphide — gases that exceed WHO safe exposure limits **long before a bin is even full**.

**MyCollect** is a cloud-connected IoT waste management platform that prioritises collection based on **health risk**, not bin capacity. It combines real-time gas and fill-level sensing, a Random Forest ML classifier, and a serverless AWS backend to give municipal operators and citizens actionable intelligence — before conditions become dangerous.

> *"Gas concentration, not how full a bin is, is the signal that matters."*

---

## ⚡ Key Results

| Metric | Result |
|--------|--------|
| ML Model Accuracy (5-fold CV) | **95.94%** |
| End-to-End Response Time | **446ms** (target: <5s) |
| Health Risk Formula | 70% gas concentration + 30% fill level |
| Priority Classes | CRITICAL · HIGH · MEDIUM · LOW |
| Dataset | 296 real sensor readings, Homagama, Sri Lanka |
| Hardware Cost | LKR 11,000 (~$35 USD) |

---

## 🏗️ System Architecture

MyCollect is split across three layers:

```
┌─────────────────────────────────────────────────────────┐
│  EDGE LAYER          CLOUD LAYER        APP LAYER        │
│                                                          │
│  NodeMCU ESP8266 ──► AWS IoT Core ──► AWS Lambda        │
│  MQ-135 (gas)        (MQTT/TLS)        ProcessBinData    │
│  HC-SR04 (fill)                        GetBinData        │
│                                            │             │
│  JSON payload                         DynamoDB           │
│  every 15 min                         BinLatestStatus    │
│                                       BinSensorData      │
│                                            │             │
│                                    ┌───────┴───────┐     │
│                                    │               │     │
│                               Next.js 14      Flutter    │
│                               Dashboard      Mobile App  │
│                               (Operators)   (Citizens)   │
└─────────────────────────────────────────────────────────┘
```

**Data Flow:** IoT Bins → MQTT (port 8883 TLS) → AWS IoT Core → Lambda → Random Forest → DynamoDB → API Gateway → Dashboard / Mobile App

---

## 📦 Repository Structure

This repository contains four components, each maintained in its own branch:

| Branch | Contents | Stack |
|--------|----------|-------|
| `web-dashboard` | Municipal operator dashboard | Next.js 14, Tailwind CSS, Leaflet.js, Chart.js |
| `mobile-app` | Citizen mobile application | Flutter, Dart, AWS Cognito |
| `backend` | AWS Lambda functions + ML model | Python 3.12, scikit-learn, boto3 |
| `main` | Project overview (this file) | — |

---

## 🔧 Tech Stack

### Hardware
- **Microcontroller:** NodeMCU ESP8266 (80MHz, 80KB RAM)
- **Gas Sensor:** MQ-135 — detects methane, ammonia, hydrogen sulphide (10–1000 PPM)
- **Fill Sensor:** HC-SR04 ultrasonic — fill level ±1cm accuracy
- **Enclosure:** IP65-rated weatherproof, 3D-printed bin mount
- **Communication:** MQTT over TLS port 8883

### Cloud (AWS)
- **AWS IoT Core** — device management and secure MQTT ingestion
- **AWS Lambda** — serverless processing (Python 3.12)
- **AWS DynamoDB** — NoSQL persistence (BinLatestStatus + BinSensorData)
- **AWS API Gateway** — CORS-enabled REST endpoints
- **AWS Cognito** — authentication (Admin · Ratepayer · Citizen)

### Web Dashboard
- Next.js 14, React, Tailwind CSS
- Leaflet.js + OpenStreetMap (colour-coded priority markers)
- Chart.js (gas/fill trend analytics)

### Mobile App
- Flutter + Dart
- Bilingual: **English + Sinhala** 🇱🇰
- Real-time bin status, collection schedules, citizen issue reporting

### Machine Learning
- Python 3.12 + scikit-learn
- Random Forest Classifier (100 trees, max depth 10, random seed 42)
- 5-fold cross-validation: **95.94% accuracy**
- Features: `gas_ppm`, `fill_level`, `temperature`, `humidity`, `weighted_score`

---

## 🧮 Health Risk Formula

The core innovation — prioritising **air quality over bin capacity**:

```
weighted_score = (gas_ppm / 1000 × 100 × 0.70) + (fill_level × 0.30)
```

| Priority | Score Range | Condition |
|----------|------------|-----------|
| 🔴 CRITICAL | 34.5 – 68.0 | gas > 500 PPM or fill > 85% |
| 🟠 HIGH | 28.7 – 32.4 | gas 300–500 PPM or fill > 70% |
| 🟡 MEDIUM | 26.8 – 37.0 | gas 100–300 PPM or fill 50–70% |
| 🟢 LOW | 3.6 – 22.0 | gas < 100 PPM and fill < 50% |

A bin at **40% full emitting 350 PPM gas** is prioritised over a bin at **90% full with clean air** — because in Sri Lanka's tropical climate, gas is the real health risk.

---

## 🌍 Why This Matters

- Tropical climate means dangerous gases form **36–48 hours before physical overflow**
- Vector-borne disease rates are **23% higher** in poorly serviced areas (Ministry of Health, 2022)
- Municipal vehicles burn **180 litres of diesel daily** on fixed routes regardless of bin conditions
- The **Meethotamulla collapse (2017)** killed 32 people — unmonitored methane buildup was a key factor
- MyCollect targets **SDG 3** (Good Health) and **SDG 11** (Sustainable Cities)

---

## 📊 ML Model Comparison

| Model | Test Accuracy | CV Accuracy (5-fold) |
|-------|-------------|---------------------|
| Decision Tree | 98.33% | 97.33% |
| K-Nearest Neighbours | 98.33% | 95.67% |
| Gradient Boosting | 98.33% | 97.33% |
| **Random Forest** ✅ | **98.33%** | **95.94%** |
| SVM | 73.33% | 75.33% |

Random Forest was selected for **superior generalisation** and robustness to sensor noise on limited real-world data.

---

## 🚀 Getting Started

See the README in each branch for full setup instructions:

- **Web Dashboard** → [`web-dashboard` branch](../../tree/web-dashboard)
- **Mobile App** → [`mobile-app` branch](../../tree/mobile-app)  
- **Backend + ML Model** → [`backend` branch](../../tree/backend)

---

## 📝 Academic Context

Submitted as **PUSL3190 Computing Project** — NSBM Green University (University of Plymouth affiliate).

Research paper submitted to **MERCon 2026 (Moratuwa Engineering Research Conference)**:

> *"Beyond Fill Level: A Gas-Weighted IoT Framework for Health-Responsive Waste Collection in Tropical Urban Environments"*  
> Dinithi Wijesinghe, Dharani Rajasinghe — NSBM Green University

---

## 📬 Contact

**Dinithi Isodhara Wijesinghe**  
BSc (Hons) Software Engineering — NSBM Green University | University of Plymouth  
📧 isodharas@gmail.com
