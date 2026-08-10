#!/usr/bin/env python3
"""Inference helpers for forecast + anomaly models."""
import json, os
import numpy as np
import torch
import torch.nn as nn

ART = os.path.join(os.path.dirname(os.path.abspath(__file__)), "artifacts")

class ForecastNet(nn.Module):
	def __init__(self, n_in=24, n_hidden=64):
		super().__init__()
		self.net = nn.Sequential(nn.Linear(n_in, n_hidden), nn.ReLU(), nn.Linear(n_hidden, n_hidden), nn.ReLU(), nn.Linear(n_hidden, 1))
	def forward(self, x): return self.net(x).squeeze(-1)

class AE(nn.Module):
	def __init__(self, n=24, h=32):
		super().__init__()
		self.enc = nn.Sequential(nn.Linear(n, h), nn.ReLU(), nn.Linear(h, 8), nn.ReLU())
		self.dec = nn.Sequential(nn.Linear(8, h), nn.ReLU(), nn.Linear(h, n))
	def forward(self, x): return self.dec(self.enc(x))

def health():
	out = {"forecast": os.path.exists(os.path.join(ART, "forecast.pt")), "anomaly": os.path.exists(os.path.join(ART, "anomaly.pt"))}
	fm = os.path.join(ART, "forecast_metrics.json")
	if os.path.exists(fm):
		with open(fm) as f: out["forecast_metrics"] = json.load(f)
	am = os.path.join(ART, "anomaly_metrics.json")
	if os.path.exists(am):
		with open(am) as f: out["anomaly_metrics"] = json.load(f)
	return out

def load_forecast():
	path = os.path.join(ART, "forecast.pt")
	if not os.path.exists(path): return None
	blob = torch.load(path, map_location="cpu", weights_only=False)
	m = ForecastNet(blob.get("seq", 24), 64)
	m.load_state_dict(blob["state_dict"]); m.eval()
	return m, blob

def predict_next(window_values):
	pack = load_forecast()
	if not pack: return None
	m, blob = pack
	mu, sd, seq = blob["mu"], blob["sd"], blob["seq"]
	w = np.asarray(window_values[-seq:], dtype=np.float32)
	if len(w) < seq: return None
	x = torch.tensor(((w - mu) / sd).astype(np.float32)).unsqueeze(0)
	with torch.no_grad():
		y = float(m(x).item()) * sd + mu
	return y
