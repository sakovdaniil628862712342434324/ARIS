# ARIS — Adaptive HVAC Intelligence Platform
SAIT CPSY 301 Capstone (Group 4) project

> Sponsor: **Applied Research & Innovation Services (ARIS)** · Contact: Maeric Rico

## What it is
ARIS is a **building automation + data intelligence web app** for SAIT facilities operators. It unifies fragmented HVAC workflows (BACnet sensors, **enteliWEB**, **CopperCube** CSV exports, weather/utility signals) into one operator UI for monitoring, analytics, demand-side management (DSM), reporting, and supervised control write-back.

Today’s pain: live data, history, weather, and pricing live in separate tools; operators decide reactively; peak-shaving opportunities are missed. ARIS proposes ETL → warehouse → dashboards → ML forecasts → DSM recommendations (with approval gates) → BACnet write-back.

## Product surface (Figma)
Source: [ARIS Web App](https://www.figma.com/design/uM5XlBXQ5JOll82GBJlmul/ARIS-Web-App?node-id=23-280)

| Area | Screens |
|------|---------|
| **Auth** | Sign In · Forgot Password · Request Access |
| **Primary** | Dashboard Overview · Sensor Network · Analytics & Predictions · DSM Recommendations · Reports · System Settings |
| **Detail** | User Profile · Activity Feed · Sensor Detail · Edit Profile · Manage Devices · Create Report |
| **Overlays** | User menu · Search · Notifications · Change Password · Sign Out confirm |

**Dashboard blocks:** KPI row (Active Sensors / System Health / Energy Savings) · Sensor Network table + donut · 24h trends · isometric zone map · 6h demand forecast · alerts feed · pending approvals (Approve / Dismiss).

## Codebase (`~/Downloads/aris-web-app/`)
Expo ~57 + React Native (web) UI · **Flask + SQLite + PyTorch** backend on GBTAC historian data.

```bash
# Terminal 1 — API (real data)
cd ~/Downloads/aris-web-app/backend
pip3 install -r requirements.txt
# already built: aris.db + ml/artifacts/*.pt
python3 app.py                    # http://127.0.0.1:5050

# Terminal 2 — UI
cd ~/Downloads/aris-web-app
npm install
npm run web
```

Rebuild DB / retrain (optional):
```bash
python3 etl/build_db.py
python3 ml/train_forecast.py      # MLP from scratch, no pretrained weights
python3 ml/train_anomaly.py       # autoencoder from scratch
```

All tabs (Dashboard, Sensors, Analytics, DSM, Reports, Settings, Activity) load from the API. DSM Approve/Dismiss logs to SQLite only (**historian mode** — no BACnet write-back per client meeting).

## Status
Working demo on **GBTAC Building Data** (2018–2025): ~686k hourly points, energy + zone temps, PyTorch forecast R²≈0.92, anomaly AE, DSM heuristics, emissions reports.
