# ARIS Backend (SQLite + PyTorch + Flask)

## Paths (hardcoded in scripts)
- Data: `../src/GBTAC Building Data/`
- DB: `./aris.db`
- Models: `./ml/artifacts/`

## Setup
```bash
pip3 install -r requirements.txt
python3 etl/build_db.py          # ~30–60s, builds aris.db from CSV
python3 ml/train_forecast.py     # PyTorch MLP from scratch
python3 ml/train_anomaly.py      # PyTorch autoencoder from scratch
python3 app.py                   # http://127.0.0.1:5050
```

## API
- `GET /api/health`
- `GET /api/dashboard` — UI-shaped KPIs, charts, alerts, DSM approvals
- `GET /api/sensors` / `GET /api/sensors/<tag>`
- `GET /api/analytics` — model metrics + series
- `GET|POST /api/dsm` / `POST /api/dsm/<id>/approve|dismiss`
- `GET /api/reports`
- `GET|POST /api/settings`
- `GET /api/activity`

Historian mode: no BACnet write-back. Approve/dismiss only logs to SQLite.
