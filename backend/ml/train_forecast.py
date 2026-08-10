#!/usr/bin/env python3
"""Train PyTorch demand forecast MLP from scratch on energy_daily / hourly HVAC. No pretrained weights."""
DB_PATH = "/Users/yuki/Downloads/aris-web-app/backend/aris.db"
ART_DIR = "/Users/yuki/Downloads/aris-web-app/backend/ml/artifacts"
EPOCHS = 80
LR = 1e-3
SEQ = 24  # hours history → predict next hour site/hvac kW proxy

import json, os, sqlite3, sys
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

def progress(m): print(m, flush=True)

class ForecastNet(nn.Module):
	def __init__(self, n_in=24, n_hidden=64):
		super().__init__()
		self.net = nn.Sequential(
			nn.Linear(n_in, n_hidden), nn.ReLU(),
			nn.Linear(n_hidden, n_hidden), nn.ReLU(),
			nn.Linear(n_hidden, 1),
		)
	def forward(self, x): return self.net(x).squeeze(-1)

def load_series():
	con = sqlite3.connect(DB_PATH)
	# Prefer HVAC hourly W as proxy demand
	row = con.execute("SELECT id FROM sensors WHERE source_code='30000_TL208'").fetchone()
	if not row:
		row = con.execute("SELECT sensor_id, COUNT(*) c FROM readings_hourly GROUP BY sensor_id ORDER BY c DESC LIMIT 1").fetchone()
		sid = row[0] if row else None
	else:
		sid = row[0]
	if not sid: con.close(); return None, None, None
	rows = con.execute("SELECT ts,value FROM readings_hourly WHERE sensor_id=? ORDER BY ts", (sid,)).fetchall()
	con.close()
	if len(rows) < SEQ + 50: return None, None, None
	ts = [r[0] for r in rows]
	vals = np.array([r[1] for r in rows], dtype=np.float64)
	# clip sentinels
	vals = np.clip(vals, np.nanpercentile(vals, 1), np.nanpercentile(vals, 99))
	vals = np.nan_to_num(vals, nan=float(np.nanmean(vals)))
	return ts, vals, sid

def make_xy(vals):
	X, y = [], []
	for i in range(SEQ, len(vals)):
		X.append(vals[i - SEQ:i])
		y.append(vals[i])
	X, y = np.asarray(X, np.float32), np.asarray(y, np.float32)
	mu, sd = float(X.mean()), float(X.std() or 1.0)
	Xn = (X - mu) / sd
	yn = (y - mu) / sd
	return Xn, yn, mu, sd

def main():
	os.makedirs(ART_DIR, exist_ok=True)
	progress("=== Train forecast (PyTorch from scratch) ===")
	ts, vals, sid = load_series()
	if vals is None:
		progress("Not enough readings — abort"); sys.exit(1)
	Xn, yn, mu, sd = make_xy(vals)
	n = len(Xn)
	split = int(n * 0.85)
	Xtr, ytr = torch.tensor(Xn[:split]), torch.tensor(yn[:split])
	Xte, yte = torch.tensor(Xn[split:]), torch.tensor(yn[split:])
	loader = DataLoader(TensorDataset(Xtr, ytr), batch_size=256, shuffle=True)
	model = ForecastNet(SEQ, 64)
	opt = torch.optim.Adam(model.parameters(), lr=LR)
	loss_fn = nn.MSELoss()
	model.train()
	for ep in range(1, EPOCHS + 1):
		total, nb = 0.0, 0
		for xb, yb in loader:
			opt.zero_grad()
			pred = model(xb)
			loss = loss_fn(pred, yb)
			loss.backward(); opt.step()
			total += float(loss.item()); nb += 1
		if ep % 10 == 0 or ep == 1:
			progress(f"  epoch {ep}/{EPOCHS} train_mse={total/max(nb,1):.5f}")
	model.eval()
	with torch.no_grad():
		pte = model(Xte).numpy()
		yte_n = yte.numpy()
		pte_w = pte * sd + mu
		yte_w = yte_n * sd + mu
		mae = float(np.mean(np.abs(pte_w - yte_w)))
		mape = float(np.mean(np.abs((pte_w - yte_w) / (np.abs(yte_w) + 1e-3)))) * 100
		# crude R2
		ss_res = float(np.sum((yte_w - pte_w) ** 2))
		ss_tot = float(np.sum((yte_w - yte_w.mean()) ** 2)) or 1.0
		r2 = 1.0 - ss_res / ss_tot
		acc = max(0.0, min(99.9, 100.0 * (1.0 - mape / 100.0)))
	path = os.path.join(ART_DIR, "forecast.pt")
	torch.save({"state_dict": model.state_dict(), "mu": mu, "sd": sd, "seq": SEQ, "sensor_id": sid}, path)
	metrics = {"mae_w": mae, "mape_pct": mape, "r2": r2, "accuracy_pct": acc, "n_train": split, "n_test": n - split, "sensor_id": sid}
	with open(os.path.join(ART_DIR, "forecast_metrics.json"), "w") as f: json.dump(metrics, f, indent=2)
	# write rolling forecasts into DB for last week + next 24h placeholders from last window
	con = sqlite3.connect(DB_PATH)
	con.execute("DELETE FROM forecasts WHERE metric='hvac_w'")
	con.execute("INSERT INTO ml_models(name,kind,path,metrics_json,active) VALUES(?,?,?,?,1)",
		("ForecastNet-MLP", "forecast", path, json.dumps(metrics)))
	mid = con.execute("SELECT last_insert_rowid()").fetchone()[0]
	# align test predictions to timestamps
	test_ts = ts[SEQ + split:]
	batch = []
	for i, t in enumerate(test_ts[: min(len(test_ts), len(pte_w))]):
		batch.append(("hvac_w", t, float(pte_w[i]), float(yte_w[i]), 1, mid))
	# future 24h: autoregressive from last SEQ
	window = vals[-SEQ:].astype(np.float32)
	model.eval()
	last_ts = ts[-1]
	from datetime import datetime, timedelta
	try: t0 = datetime.fromisoformat(last_ts.replace("Z", ""))
	except Exception: t0 = datetime.utcnow()
	fut = []
	w = window.copy()
	with torch.no_grad():
		for h in range(1, 25):
			x = torch.tensor(((w - mu) / sd).astype(np.float32)).unsqueeze(0)
			yhat = float(model(x).item()) * sd + mu
			t1 = (t0 + timedelta(hours=h)).strftime("%Y-%m-%dT%H:00:00")
			fut.append(("hvac_w", t1, yhat, None, h, mid))
			w = np.concatenate([w[1:], np.array([yhat], np.float32)])
	con.executemany("INSERT OR REPLACE INTO forecasts(metric,ts,yhat,actual,horizon_h,model_id) VALUES(?,?,?,?,?,?)", batch + fut)
	con.commit(); con.close()
	progress(f"Saved {path}")
	progress(f"Metrics: MAE={mae:.1f} W  MAPE={mape:.1f}%  R²={r2:.3f}  acc≈{acc:.1f}%")
	progress("=== forecast train done ===")

if __name__ == "__main__":
	main()
