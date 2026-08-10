#!/usr/bin/env python3
"""Train PyTorch autoencoder anomaly detector from scratch on HVAC hourly series."""
DB_PATH = "/Users/yuki/Downloads/aris-web-app/backend/aris.db"
ART_DIR = "/Users/yuki/Downloads/aris-web-app/backend/ml/artifacts"
EPOCHS = 60
LR = 1e-3
SEQ = 24

import json, os, sqlite3, sys
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

def progress(m): print(m, flush=True)

class AE(nn.Module):
	def __init__(self, n=24, h=32):
		super().__init__()
		self.enc = nn.Sequential(nn.Linear(n, h), nn.ReLU(), nn.Linear(h, 8), nn.ReLU())
		self.dec = nn.Sequential(nn.Linear(8, h), nn.ReLU(), nn.Linear(h, n))
	def forward(self, x):
		z = self.enc(x)
		return self.dec(z)

def main():
	os.makedirs(ART_DIR, exist_ok=True)
	progress("=== Train anomaly AE (PyTorch from scratch) ===")
	con = sqlite3.connect(DB_PATH)
	row = con.execute("SELECT id FROM sensors WHERE source_code='30000_TL208'").fetchone()
	if not row:
		progress("No HVAC sensor"); sys.exit(1)
	sid = row[0]
	rows = con.execute("SELECT ts,value FROM readings_hourly WHERE sensor_id=? ORDER BY ts", (sid,)).fetchall()
	con.close()
	if len(rows) < SEQ + 100:
		progress("Not enough data"); sys.exit(1)
	ts = [r[0] for r in rows]
	vals = np.array([r[1] for r in rows], dtype=np.float64)
	vals = np.clip(vals, np.nanpercentile(vals, 1), np.nanpercentile(vals, 99))
	vals = np.nan_to_num(vals, nan=float(np.mean(vals)))
	X = np.stack([vals[i - SEQ:i] for i in range(SEQ, len(vals))]).astype(np.float32)
	mu, sd = float(X.mean()), float(X.std() or 1.0)
	Xn = (X - mu) / sd
	loader = DataLoader(TensorDataset(torch.tensor(Xn), torch.tensor(Xn)), batch_size=256, shuffle=True)
	model = AE(SEQ, 32)
	opt = torch.optim.Adam(model.parameters(), lr=LR)
	loss_fn = nn.MSELoss()
	model.train()
	for ep in range(1, EPOCHS + 1):
		tot, nb = 0.0, 0
		for xb, yb in loader:
			opt.zero_grad()
			recon = model(xb)
			loss = loss_fn(recon, yb)
			loss.backward(); opt.step()
			tot += float(loss.item()); nb += 1
		if ep % 10 == 0 or ep == 1: progress(f"  epoch {ep}/{EPOCHS} recon_mse={tot/max(nb,1):.5f}")
	model.eval()
	with torch.no_grad():
		recon = model(torch.tensor(Xn)).numpy()
		err = np.mean((Xn - recon) ** 2, axis=1)
	thr = float(np.percentile(err, 98))
	path = os.path.join(ART_DIR, "anomaly.pt")
	torch.save({"state_dict": model.state_dict(), "mu": mu, "sd": sd, "seq": SEQ, "threshold": thr, "sensor_id": sid}, path)
	metrics = {"threshold": thr, "mean_err": float(err.mean()), "sensor_id": sid}
	with open(os.path.join(ART_DIR, "anomaly_metrics.json"), "w") as f: json.dump(metrics, f, indent=2)
	# insert top anomalies as alerts
	con = sqlite3.connect(DB_PATH)
	con.execute("INSERT INTO ml_models(name,kind,path,metrics_json,active) VALUES(?,?,?,?,1)",
		("AnomalyAE", "anomaly", path, json.dumps(metrics)))
	idx = np.argsort(err)[-15:]
	for i in idx:
		if err[i] < thr: continue
		t = ts[SEQ + i]
		v = float(vals[SEQ + i])
		con.execute("INSERT INTO alerts(sensor_id,severity,kind,title,message,ts) VALUES(?,?,?,?,?,?)",
			(sid, "high", "ml_anomaly", "ML anomaly — HVAC load", f"AE reconstruction error {err[i]:.3f} (thr {thr:.3f}); value={v:.0f} W", t))
	con.commit(); con.close()
	progress(f"Saved {path} thr={thr:.4f} flagged≈{int((err>=thr).sum())}")
	progress("=== anomaly train done ===")

if __name__ == "__main__":
	main()
