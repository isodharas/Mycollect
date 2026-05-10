<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=MyCollect&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=AI-Powered%20IoT%20Waste%20Management%20System&descAlignY=55&descSize=20" width="100%"/>

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=6BA53A&center=true&vCenter=true&width=600&lines=Health-First+Smart+Waste+Collection;Real-Time+IoT+Sensor+Monitoring;AI-Powered+Route+Optimisation;Built+for+Sri+Lanka+%F0%9F%87%B1%F0%9F%87%B0)](https://git.io/typing-svg)

<br/>

![Stars](https://img.shields.io/github/stars/isodharas/Mycollect?style=for-the-badge&logo=github&color=6BA53A)
![Last Commit](https://img.shields.io/github/last-commit/isodharas/Mycollect?style=for-the-badge&color=2D6A4F)
![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs)
![AWS](https://img.shields.io/badge/AWS-Serverless-FF9900?style=for-the-badge&logo=amazonaws)

</div>

---

## 🌿 Why MyCollect?

> *"On April 14, 2017, the Meethotamulla garbage mountain in Colombo collapsed — killing 32 people. There was no warning system."*

Traditional waste management in Sri Lanka operates on **fixed schedules** — trucks collect bins whether they are full or empty, wasting fuel, time, and resources. Critically, **no system monitors the toxic gases** emitted from overflowing bins, creating invisible health hazards in residential areas.

**MyCollect changes this.** Using IoT sensors, machine learning, and real-time data, MyCollect classifies bins by **health risk** — not just fill level — and routes collection trucks to where they are needed most.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        HARDWARE LAYER                           │
│   NodeMCU ESP8266 + MQ-135 Gas Sensor + HC-SR04 Ultrasonic     │
│              HTTP POST every 60 seconds                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         AWS CLOUD                               │
│  API Gateway → Lambda (ProcessBinData) → DynamoDB               │
│                        ↓                                        │
│              Random Forest Classifier                           │
│         CRITICAL / HIGH / MEDIUM / LOW                          │
└──────────┬──────────────────────────────┬───────────────────────┘
           │                              │
           ▼                              ▼
┌─────────────────┐            ┌──────────────────────┐
│  Next.js 14     │            │   Flutter Mobile App  │
│  Web Dashboard  │◄──────────►│   (Android/iOS)       │
│  Admin Portal   │  Real-time │   Citizen + Worker    │
└─────────────────┘            └──────────────────────┘
```

---

## ✨ Key Features

| Feature | Description |
|--------|-------------|
| 🤖 **AI Classification** | Random Forest model — 95.94% accuracy across 616 real sensor readings |
| 🧪 **Health-First Formula** | `Risk = (gas_ppm/1000 × 100 × 0.70) + (fill_level × 0.30)` |
| 🗺️ **Live Bin Map** | OpenStreetMap with real-time colour-coded bin status |
| ⚡ **Real-Time Sync** | Worker collects bin → citizen app updates instantly |
| 🌍 **Bilingual** | Full English and සිංහල (Sinhala) support |
| 📅 **Smart Scheduling** | Dynamic collection routes based on health risk priority |
| 📱 **Citizen Reports** | Citizens submit bin issues → admin reviews on web dashboard |
| 🔔 **Schedule Alerts** | Push notification when collection schedule changes |

---

## 📊 Performance Metrics

<div align="center">

| Metric | Value |
|--------|-------|
| 🎯 ML Accuracy | **95.94%** (5-fold cross-validation) |
| ⚡ API Latency | **1.12s** average response time |
| 🚨 CRITICAL Detection | **47 bins** flagged vs 301 with fill-only systems |
| ⛽ Fuel Reduction | **15–20%** projected saving vs fixed schedules |
| 📡 Sensor Interval | **60 seconds** (demo) / 15 minutes (production) |

</div>

---

## 🛠️ Technology Stack

<div align="center">

### Hardware
![NodeMCU](https://img.shields.io/badge/NodeMCU-ESP8266-E7352C?style=for-the-badge&logo=espressif)
![Arduino](https://img.shields.io/badge/Arduino-C++-00979D?style=for-the-badge&logo=arduino)

### Backend & Cloud
![AWS Lambda](https://img.shields.io/badge/AWS_Lambda-Serverless-FF9900?style=for-the-badge&logo=awslambda)
![DynamoDB](https://img.shields.io/badge/DynamoDB-NoSQL-4053D6?style=for-the-badge&logo=amazondynamodb)
![API Gateway](https://img.shields.io/badge/API_Gateway-REST-FF4F8B?style=for-the-badge&logo=amazonaws)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python)

### Machine Learning
![scikit-learn](https://img.shields.io/badge/scikit--learn-RandomForest-F7931E?style=for-the-badge&logo=scikitlearn)

### Web Dashboard
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss)

### Mobile App
![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter)
![Dart](https://img.shields.io/badge/Dart-3.x-0175C2?style=for-the-badge&logo=dart)
![Android](https://img.shields.io/badge/Android-14-3DDC84?style=for-the-badge&logo=android)

</div>

---

## 📁 Repository Structure

```
Mycollect/
├── 🌐 web-dashboard      → Next.js 14 admin portal
│   ├── app/              → Pages (dashboard, bins, routes, analytics, alerts, reports)
│   ├── components/       → Reusable UI components
│   └── lib/              → API client, DynamoDB, auth
│
├── ☁️  backend           → AWS serverless backend
│   ├── lambda_functions/ → ProcessBinData, GetBinData, CitizenAuth, VerifyRatepayer
│   └── ml_model/         → Random Forest model (train_model.py + model.pkl)
│
└── 📱 mycollect-mobile   → Flutter mobile application
    ├── lib/screens/      → Citizen + Worker screens
    ├── lib/services/     → API, Auth, Session, Language services
    └── android/          → Android configuration
```

---

## 🚀 Quick Start

### Web Dashboard
```bash
cd web-dashboard
npm install
npm run dev
# Open http://localhost:3000
# Login: admin@mycollect.lk / admin123
```

### Mobile App
```bash
cd mycollect-mobile
flutter pub get
flutter run -d <DEVICE_ID>
# Worker: WRK-001 / PIN: 1234
```

---

## 🎯 Demo Credentials

| Role | Credential |
|------|-----------|
| Admin (Web) | admin@mycollect.lk / admin123 |
| Citizen | Phone: 743242650 / Password: password123 |
| Worker 1 | WRK-001 / PIN: 1234 |
| Worker 2 | WRK-002 / PIN: 5678 |

---

## 🎓 Academic Information

<div align="center">

| | |
|--|--|
| **Student** | Dinithi Wijesinghe |
| **Student ID** | 10952811 |
| **University** | NSBM Green University (Plymouth University) |
| **Module** | PUSL3190 — Final Year Project |
| **Supervisor** | Miss Dharani Rajasinghe |
| **Year** | 2025 / 2026 |

</div>

---

## 🌱 SDG Alignment

- **SDG 3** — Good Health and Well-Being: Reduces toxic gas exposure in residential areas
- **SDG 11** — Sustainable Cities and Communities: Smarter, data-driven municipal waste management

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=100&section=footer" width="100%"/>

*Built with ❤️ for Homagama · Sri Lanka 🇱🇰*

</div>
