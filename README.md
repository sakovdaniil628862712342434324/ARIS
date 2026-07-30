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

## Codebase (`aris-web-app/`)
Expo ~57 + React Native 0.86 + TypeScript screens · NativeWind tokens · StyleSheet UI

```bash
npm install
npm run web
```

Flow: **Sign In → Dashboard** (demo auth). Forgot Password / Request Access are wired. Other nav destinations are stubbed to Dashboard until built.

## Docs in this folder
| File | Role |
|------|------|
| `Capstone Project - Phase 2.docx` | Requirements, architecture layers, use cases |
| `Project Phase 3 - Final Design and Project Timeline.docx` | Sequence/activity diagrams, prototype, Gantt |
| `D2L/` | Weekly progress + phase templates |
| `Figma/`, `aris-demo-*.mp4` | Design exports / demo assets |

## Status
Prototype UI matching Figma Sign In + Dashboard Overview. Backend, BACnet, ETL, and ML are design-phase — not in this Expo app yet.
