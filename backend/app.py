#!/usr/bin/env python3
"""ARIS Flask API — serves SQLite historian + ML for Expo UI."""
import csv, json, math, os, sqlite3
from datetime import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS

ROOT = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(ROOT, "aris.db")
TOU_PATH = os.path.join(ROOT, "data", "aeso_tou_snapshot.csv")
ELECF = 0.54
OAT_CODE = "20000_TL92"  # HWS_Outside_Temp_POLL — best outdoor proxy in historian
HVAC_CODE = "30000_TL208"

app = Flask(__name__)
CORS(app)

def db():
	con = sqlite3.connect(DB_PATH)
	con.row_factory = sqlite3.Row
	return con

def jrows(rows): return [dict(r) for r in rows]

def spark_from(vals, n=10):
	if not vals: return [8] * n
	v = list(vals)[-n:]
	while len(v) < n: v = [v[0]] + v
	mn, mx = min(v), max(v)
	span = (mx - mn) or 1.0
	return [int(8 + 22 * (x - mn) / span) for x in v]

def heights_from(vals, n=12):
	if not vals: return [40] * n
	v = list(vals)[-n:]
	while len(v) < n: v = [v[0]] + v
	mn, mx = min(v), max(v)
	span = (mx - mn) or 1.0
	return [int(40 + 55 * (x - mn) / span) for x in v]

def load_tou():
	rows = []
	with open(TOU_PATH, newline="", encoding="utf-8") as f:
		for r in csv.DictReader(f):
			rows.append({"hour": int(r["hour"]), "period": r["period"], "price": float(r["price_cents_kwh"]), "note": r.get("note") or ""})
	return rows

def pearson(xs, ys):
	n = len(xs)
	if n < 3: return 0.0
	mx, my = sum(xs) / n, sum(ys) / n
	num = sum((x - mx) * (y - my) for x, y in zip(xs, ys))
	dx = math.sqrt(sum((x - mx) ** 2 for x in xs))
	dy = math.sqrt(sum((y - my) ** 2 for y in ys))
	return (num / (dx * dy)) if dx and dy else 0.0

def energy_temp_series(con, days=60):
	# daily means: outdoor temp vs HVAC power — client energy↔temp ask
	rows = jrows(con.execute("""
		SELECT substr(h.ts,1,10) as day, AVG(h.value) as hvac_w, AVG(o.value) as oat_c
		FROM readings_hourly h
		JOIN sensors sh ON sh.id=h.sensor_id AND sh.source_code=?
		JOIN readings_hourly o ON o.ts=h.ts
		JOIN sensors so ON so.id=o.sensor_id AND so.source_code=?
		WHERE h.ts >= (SELECT date(MAX(ts), ?) FROM readings_hourly)
		GROUP BY substr(h.ts,1,10) ORDER BY day""", (HVAC_CODE, OAT_CODE, f"-{int(days)} days")))
	oats = [r["oat_c"] for r in rows if r["oat_c"] is not None and r["hvac_w"] is not None]
	hvacs = [r["hvac_w"] for r in rows if r["oat_c"] is not None and r["hvac_w"] is not None]
	r = pearson(oats, hvacs)
	return {
		"points": [{"day": x["day"], "oat": round(x["oat_c"], 2), "hvac": round(x["hvac_w"], 1)} for x in rows],
		"oatHeights": heights_from(oats, n=min(24, max(8, len(oats)))),
		"hvacHeights": heights_from(hvacs, n=min(24, max(8, len(hvacs)))),
		"correlation": round(r, 3),
		"nDays": len(rows),
		"oatSensor": OAT_CODE,
		"hvacSensor": HVAC_CODE,
		"note": "Daily means · Outside temp (HWS_Outside_Temp_POLL) vs Space HVAC W",
	}

def emissions_bundle(con):
	ed = con.execute("SELECT * FROM energy_daily ORDER BY day DESC LIMIT 1").fetchone()
	hist = [r[0] for r in con.execute("""
		SELECT (COALESCE(hvac_kwh,0)+COALESCE(lighting_kwh,0)+COALESCE(dhw_kwh,0)+COALESCE(rnd_kwh,0)+COALESCE(appliances_kwh,0))*?
		FROM energy_daily ORDER BY day DESC LIMIT 14""", (ELECF,))]
	hist = list(reversed(hist))
	if not ed:
		return {"todayKg": 0, "factor": ELECF, "spark": spark_from([]), "label": "0 kg", "detail": "no energy_daily"}
	load = sum((ed[k] or 0) for k in ("hvac_kwh", "lighting_kwh", "dhw_kwh", "rnd_kwh", "appliances_kwh"))
	today = load * ELECF  # operational CO₂e from end-use loads (site_kw can be export-signed)
	pv_kw = (ed["pv_carport_kw"] or 0) + (ed["pv_rooftop_kw"] or 0)
	avoided = pv_kw * 24 * ELECF
	return {
		"todayKg": round(today, 1),
		"avoidedKg": round(avoided, 1),
		"factor": ELECF,
		"day": ed["day"],
		"spark": spark_from(hist or [today]),
		"label": f"{today:.0f} kg",
		"detail": f"Alberta grid factor {ELECF} kg/kWh · PV avoided ~{avoided:.0f} kg",
	}

def forecast_compare(con):
	rows = jrows(con.execute("""
		SELECT ts, yhat, actual FROM forecasts WHERE metric='hvac_w' AND actual IS NOT NULL
		ORDER BY ts DESC LIMIT 24"""))
	rows = list(reversed(rows))
	pred = [r["yhat"] for r in rows]
	act = [r["actual"] for r in rows]
	errs = [abs(p - a) for p, a in zip(pred, act)] if rows else []
	mae = (sum(errs) / len(errs)) if errs else 0.0
	mape = (100.0 * sum(abs(p - a) / max(abs(a), 1e-6) for p, a in zip(pred, act)) / len(act)) if act else 0.0
	bias = (sum(p - a for p, a in zip(pred, act)) / len(act)) if act else 0.0
	m = con.execute("SELECT metrics_json FROM ml_models WHERE kind='forecast' AND active=1 ORDER BY id DESC LIMIT 1").fetchone()
	metrics = json.loads(m[0]) if m and m[0] else {}
	return {
		"predHeights": heights_from(pred),
		"actualHeights": heights_from(act),
		"maeW": round(mae, 1),
		"mapePct": round(mape, 1),
		"biasW": round(bias, 1),
		"r2": round(float(metrics.get("r2", 0)), 3),
		"holdoutAcc": round(float(metrics.get("accuracy_pct", 0)), 1),
		"n": len(rows),
		"note": "Holdout compare · predicted vs actual HVAC W (Ecosphere-style)",
	}

def tou_payload(hour=None):
	rows = load_tou()
	h = hour if hour is not None else datetime.now().hour
	cur = next((r for r in rows if r["hour"] == h), rows[0])
	prices = [r["price"] for r in rows]
	mx = max(prices) or 1.0
	# shift suggestions: move flexible load from on-peak hours to cheapest off-peak
	on = [r for r in rows if r["period"] == "On-Peak"]
	off = sorted([r for r in rows if r["period"] == "Off-Peak"], key=lambda x: x["price"])
	peak_h = ", ".join(f"{r['hour']:02d}:00" for r in on[:4])
	cheap = off[0] if off else rows[0]
	return {
		"hours": rows,
		"heights": [int(12 + 88 * (r["price"] / mx)) for r in rows],
		"periodColors": [{"hour": r["hour"], "period": r["period"], "price": r["price"]} for r in rows],
		"now": {"hour": h, "period": cur["period"], "price": cur["price"]},
		"suggestion": f"Defer flexible loads from On-Peak ({peak_h}) toward {cheap['hour']:02d}:00 ({cheap['period']} · {cheap['price']:.1f}¢/kWh).",
		"source": "Bundled AESO-style TOU snapshot CSV (historian mode — not live pool price)",
	}

@app.get("/api/health")
def health():
	ml = {}
	try:
		from ml.infer import health as mh
		ml = mh()
	except Exception as e:
		ml = {"error": str(e)}
	return jsonify({"ok": os.path.exists(DB_PATH), "db": os.path.exists(DB_PATH), "ml": ml})

@app.get("/api/dashboard")
def dashboard():
	con = db()
	# sensor status by type
	types = jrows(con.execute("""
		SELECT sensor_type as cat,
			SUM(CASE WHEN in_timeseries=1 THEN 1 ELSE 0 END) as online,
			0 as warn, 0 as offline
		FROM sensors WHERE active=1 GROUP BY sensor_type ORDER BY cat"""))
	total = con.execute("SELECT COUNT(*) FROM sensors WHERE active=1 AND in_timeseries=1").fetchone()[0]
	active_all = con.execute("SELECT COUNT(*) FROM sensors WHERE active=1").fetchone()[0] or 1
	pct = round(100.0 * total / active_all, 1)
	# energy today = last energy_daily day
	ed = con.execute("SELECT * FROM energy_daily ORDER BY day DESC LIMIT 1").fetchone()
	savings = 0.0
	if ed:
		savings = max(0.0, (ed["pv_carport_kw"] + ed["pv_rooftop_kw"]) * 24 * 0.3)  # rough avoided import
	em = emissions_bundle(con)
	# sparkline from recent HVAC
	hvac = con.execute("""
		SELECT rh.value FROM readings_hourly rh
		JOIN sensors s ON s.id=rh.sensor_id WHERE s.source_code=?
		ORDER BY rh.ts DESC LIMIT 48""", (HVAC_CODE,)).fetchall()
	hvals = [r[0] for r in reversed(hvac)]
	# alerts
	alerts = jrows(con.execute("SELECT title, ts as time FROM alerts ORDER BY ts DESC LIMIT 8"))
	for a in alerts:
		a["time"] = a["time"][:16].replace("T", " ")
	# DSM pending as approvals
	recs = jrows(con.execute("SELECT id, action as title, created_at as sent, impact_kwh, confidence FROM dsm_recommendations WHERE status='Pending' ORDER BY id LIMIT 6"))
	approvals = []
	for r in recs:
		approvals.append({
			"id": str(r["id"]),
			"title": r["title"],
			"sent": str(r["sent"])[:16],
			"impact": f"−{r['impact_kwh']:.1f} kWh/day",
		})
	# forecast heights + compare
	fc = [r[0] for r in con.execute("SELECT yhat FROM forecasts WHERE metric='hvac_w' AND actual IS NULL ORDER BY ts LIMIT 12")]
	act = [r[0] for r in con.execute("SELECT actual FROM forecasts WHERE metric='hvac_w' AND actual IS NOT NULL ORDER BY ts DESC LIMIT 12")]
	act = list(reversed(act))
	cmp = forecast_compare(con)
	health_label = "Excellent" if pct >= 90 else ("Good" if pct >= 70 else "Degraded")
	zones = [r[0] for r in con.execute("SELECT DISTINCT zone FROM sensors WHERE active=1 AND zone!='Building' LIMIT 4")]
	if len(zones) < 4: zones = ["North", "South", "East", "West"]
	out = {
		"kpis": [
			{"label": "Active Sensors", "value": f"{pct}%", "spark": spark_from(hvals)},
			{"label": "System Health", "value": health_label, "spark": spark_from(hvals[::2] if hvals else [])},
			{"label": "Energy Savings Today", "value": f"{savings:.0f} kWh", "spark": spark_from([savings + i for i in range(10)])},
			{"label": "Emissions (CO₂e)", "value": em["label"], "spark": em["spark"], "detail": em["detail"]},
		],
		"emissions": em,
		"compare": cmp,
		"sensorRows": types or [{"cat": "Temperature", "online": 0, "warn": 0, "offline": 0}],
		"onlineCount": total,
		"trendHeights": heights_from(hvals),
		"forecastHeights": heights_from(fc or act or hvals),
		"zones": zones[:4],
		"alerts": alerts,
		"approvals": approvals,
		"replayDay": (ed["day"] if ed else None),
		"subtitle": "Historian mode · GBTAC Solar Lab · SQLite + PyTorch · no 3D",
	}
	con.close()
	return jsonify(out)

@app.get("/api/sensors")
def sensors():
	con = db()
	latest = con.execute("SELECT MAX(ts) FROM readings_hourly").fetchone()[0]
	rows = jrows(con.execute("""
		SELECT s.id, s.source_code as tag, s.report_name as name, s.sensor_type as type, s.zone, s.unit,
			s.in_timeseries, (
				SELECT rh.value FROM readings_hourly rh WHERE rh.sensor_id=s.id ORDER BY rh.ts DESC LIMIT 1
			) as value, (
				SELECT rh.ts FROM readings_hourly rh WHERE rh.sensor_id=s.id ORDER BY rh.ts DESC LIMIT 1
			) as last_ts
		FROM sensors s WHERE s.active=1 ORDER BY s.sensor_type, s.report_name LIMIT 200
	"""))
	out = []
	online = warn = offline = 0
	for r in rows:
		status = "Offline"
		if r["last_ts"]:
			status = "Online" if r["in_timeseries"] else "Warning"
			if latest and r["last_ts"][:10] < str(latest)[:10]:
				status = "Warning"
		if status == "Online": online += 1
		elif status == "Warning": warn += 1
		else: offline += 1
		reading = "—"
		if r["value"] is not None:
			u = r["unit"] or ""
			reading = f"{r['value']:.1f} {u}".strip()
		out.append({
			"tag": r["tag"], "type": r["type"] or "Analog", "zone": r["zone"] or "Building",
			"reading": reading, "battery": "—", "seen": (r["last_ts"] or "—")[:16].replace("T", " "),
			"status": status, "name": r["name"] or r["tag"],
		})
	# zone / category charts
	zones = jrows(con.execute("SELECT zone, COUNT(*) c FROM sensors WHERE active=1 GROUP BY zone ORDER BY c DESC LIMIT 4"))
	zmax = max([z["c"] for z in zones] or [1])
	zoneBars = [int(100 * z["c"] / zmax) for z in zones] or [70, 55, 85, 40]
	zoneLabels = [z["zone"][:4] for z in zones] or ["Z1", "Z2", "Z3", "Z4"]
	cats = jrows(con.execute("SELECT sensor_type as t, SUM(in_timeseries)*1.0/COUNT(*) as f FROM sensors WHERE active=1 GROUP BY sensor_type"))
	catBars = [[c["t"], round(float(c["f"] or 0), 2)] for c in cats] or [["Temperature", 0.7]]
	con.close()
	return jsonify({
		"kpis": [["TOTAL", str(len(out))], ["ONLINE", str(online)], ["WARNING", str(warn)], ["OFFLINE", str(offline)]],
		"sensors": out,
		"zoneBars": zoneBars,
		"zoneLabels": zoneLabels,
		"categoryBars": catBars,
	})

@app.get("/api/sensors/<tag>")
def sensor_detail(tag):
	con = db()
	s = con.execute("SELECT * FROM sensors WHERE source_code=? OR full_name=?", (tag, "SaitSolarLab_" + tag)).fetchone()
	if not s:
		con.close(); return jsonify({"error": "not found"}), 404
	sid = s["id"]
	series = [r[0] for r in con.execute("SELECT value FROM readings_hourly WHERE sensor_id=? ORDER BY ts DESC LIMIT 48", (sid,))]
	series = list(reversed(series))
	last = con.execute("SELECT ts,value FROM readings_hourly WHERE sensor_id=? ORDER BY ts DESC LIMIT 1", (sid,)).fetchone()
	status = "Online" if s["in_timeseries"] else "Offline"
	val = f"{last['value']:.1f} {s['unit']}".strip() if last else "—"
	out = {
		"tag": s["source_code"], "name": s["report_name"], "type": s["sensor_type"], "zone": s["zone"],
		"kpis": [["STATUS", status], ["READING", val], ["TYPE", s["sensor_type"]], ["LAST", (last["ts"] if last else "—")[:16]]],
		"subtitle": f"{s['sensor_type']} · {s['zone']} · historian",
		"heights": heights_from(series),
		"series": series,
	}
	con.close()
	return jsonify(out)

@app.get("/api/analytics")
def analytics():
	con = db()
	m = con.execute("SELECT * FROM ml_models WHERE kind='forecast' AND active=1 ORDER BY id DESC LIMIT 1").fetchone()
	metrics = json.loads(m["metrics_json"]) if m and m["metrics_json"] else {}
	pred = [r[0] for r in con.execute("SELECT yhat FROM forecasts WHERE metric='hvac_w' AND actual IS NOT NULL ORDER BY ts DESC LIMIT 12")]
	act = [r[0] for r in con.execute("SELECT actual FROM forecasts WHERE metric='hvac_w' AND actual IS NOT NULL ORDER BY ts DESC LIMIT 12")]
	fut = [r[0] for r in con.execute("SELECT yhat FROM forecasts WHERE metric='hvac_w' AND actual IS NULL ORDER BY ts LIMIT 12")]
	pred, act = list(reversed(pred)), list(reversed(act))
	# monthly load-based emissions (avoid signed site_kw)
	months = jrows(con.execute("""
		SELECT substr(day,1,7) as m,
			AVG(COALESCE(hvac_kwh,0)+COALESCE(lighting_kwh,0)+COALESCE(dhw_kwh,0)+COALESCE(rnd_kwh,0)+COALESCE(appliances_kwh,0)) as load_kwh,
			SUM((COALESCE(hvac_kwh,0)+COALESCE(lighting_kwh,0)+COALESCE(dhw_kwh,0)+COALESCE(rnd_kwh,0)+COALESCE(appliances_kwh,0))*?) as em,
			AVG(pv_carport_kw+pv_rooftop_kw) as pv
		FROM energy_daily GROUP BY substr(day,1,7) ORDER BY m DESC LIMIT 7""", (ELECF,)))
	months = list(reversed(months))
	monthBars = []
	for row in months:
		label = row["m"][5:] if row["m"] else "?"
		monthBars.append([label, int(min(95, max(20, (row["load_kwh"] or 0) * 1.2)))])
	mae = metrics.get("mae_w", 0)
	acc = metrics.get("accuracy_pct", 0)
	cmp = forecast_compare(con)
	et = energy_temp_series(con)
	em = emissions_bundle(con)
	tou = tou_payload()
	out = {
		"kpis": [
			["MODEL", (m["name"] if m else "ForecastNet-MLP")],
			["PREDICTION ACCURACY", f"{acc:.1f}%"],
			["MAE", f"{mae:.1f} W"],
			["EMISSIONS FACTOR", f"{ELECF} kg/kWh"],
			["CO₂e (replay day)", em["label"]],
			["ENERGY↔TEMP r", f"{et['correlation']}"],
		],
		"predHeights": heights_from(pred or act),
		"actualHeights": heights_from(act or pred),
		"forecastHeights": heights_from(fut or pred),
		"monthBars": monthBars or [["Jan", 40]],
		"compare": cmp,
		"energyTemp": et,
		"emissions": em,
		"tou": tou,
		"metrics": metrics,
		"note": "PyTorch MLP from scratch · energy↔temp · AESO-style TOU snapshot · no 3D heatmap.",
	}
	con.close()
	return jsonify(out)

@app.get("/api/dsm")
def dsm():
	con = db()
	recs = jrows(con.execute("SELECT * FROM dsm_recommendations ORDER BY id"))
	out = []
	for r in recs:
		out.append({
			"id": str(r["id"]), "zone": r["zone"], "action": r["action"], "reason": r["reason"],
			"impact": f"−{r['impact_kwh']:.1f} kWh/day · {int(r['confidence']*100)}% confidence",
			"priority": r["priority"], "status": r["status"],
		})
	pending = sum(1 for r in out if r["status"] == "Pending")
	pot = sum(r["impact_kwh"] for r in recs if r["status"] == "Pending")
	real = sum(r["impact_kwh"] for r in recs if r["status"] == "Approved")
	tou = tou_payload()
	con.close()
	return jsonify({
		"kpis": [
			["OPEN RECOMMENDATIONS", str(pending)],
			["POTENTIAL SAVINGS", f"{pot:.1f}", "kWh/day"],
			["REALIZED SAVINGS", f"{real:.1f}", "kWh/day"],
			["TOU NOW", f"{tou['now']['price']:.1f}¢", tou["now"]["period"]],
		],
		"tou": tou,
		"recommendations": out,
	})

@app.post("/api/dsm/<rid>/<action>")
def dsm_act(rid, action):
	if action not in ("Approved", "Dismissed", "approve", "dismiss"):
		return jsonify({"error": "bad action"}), 400
	status = "Approved" if action.lower().startswith("a") else "Dismissed"
	con = db()
	con.execute("UPDATE dsm_recommendations SET status=?, decided_at=datetime('now') WHERE id=?", (status, rid))
	con.commit(); con.close()
	return jsonify({"ok": True, "id": rid, "status": status})

@app.get("/api/reports")
def reports():
	con = db()
	days = jrows(con.execute("SELECT * FROM energy_daily ORDER BY day DESC LIMIT 30"))
	reports = []
	if days:
		d0, d1 = days[-1]["day"], days[0]["day"]
		sav = sum(max(0, (d["pv_carport_kw"] + d["pv_rooftop_kw"]) * 24 * 0.25) for d in days)
		em = sum((d["emissions_kg"] or 0) for d in days)
		reports = [
			{"name": "Energy & PV Summary", "period": f"{d0} → {d1}", "generated": d1[5:], "savings": f"{sav:.0f} kWh", "format": "CSV", "status": "Ready"},
			{"name": "Emissions (Alberta factor)", "period": f"Last {len(days)} days", "generated": d1[5:], "savings": f"{em:.0f} kg CO₂", "format": "PDF", "status": "Ready"},
			{"name": "HVAC Forecast Report", "period": "Model holdout", "generated": "—", "savings": "—", "format": "PDF", "status": "Ready"},
		]
	bars = heights_from([d["site_kw"] for d in reversed(days)] if days else [])
	con.close()
	return jsonify({
		"reports": reports,
		"savingsHeights": bars,
		"scheduled": [["Monthly Energy Summary", "1st of month · 06:00"], ["Weekly Emissions Digest", "Mondays · 07:00"]],
	})

@app.get("/api/settings")
def settings_get():
	con = db()
	rows = {r["key"]: r["value"] for r in con.execute("SELECT key,value FROM building_settings")}
	ver = rows.get("version", "ARIS v2.5.0")
	latest = con.execute("SELECT MAX(ts) FROM readings_hourly").fetchone()[0] or "—"
	n = con.execute("SELECT COUNT(*) FROM readings_hourly").fetchone()[0]
	bak = os.path.exists(DB_PATH + ".bak")
	con.close()
	return jsonify({
		"auto": {
			"a": rows.get("auto_approve_dsm", "false") == "true",
			"b": rows.get("night_purge", "true") == "true",
			"c": rows.get("peak_shaving", "true") == "true",
			"d": rows.get("dark_theme", "false") == "true",
		},
		"note": {
			"a": rows.get("notify_offline", "true") == "true",
			"b": rows.get("notify_dsm", "true") == "true",
			"c": rows.get("notify_digest", "false") == "true",
		},
		"integrations": [
			["Historian CSV (GBTAC)", "Synced"],
			["SQLite Warehouse", "Connected"],
			["PyTorch Forecast", "Ready" if os.path.exists(os.path.join(ROOT, "ml/artifacts/forecast.pt")) else "Pending"],
			["AESO TOU (snapshot)", "Loaded" if os.path.exists(TOU_PATH) else "Missing"],
			["Demo backup (.bak)", "Ready" if bak else "Missing"],
		],
		"backupReady": bak,
		"footer": f"{ver} · historian mode · {n:,} hourly pts · last ts {latest}",
	})

@app.post("/api/settings")
def settings_set():
	body = request.get_json(force=True, silent=True) or {}
	con = db()
	mapping = {
		"auto.a": "auto_approve_dsm", "auto.b": "night_purge", "auto.c": "peak_shaving", "auto.d": "dark_theme",
		"note.a": "notify_offline", "note.b": "notify_dsm", "note.c": "notify_digest",
	}
	auto, note = body.get("auto", {}), body.get("note", {})
	for k, key in [("a", "auto.a"), ("b", "auto.b"), ("c", "auto.c"), ("d", "auto.d")]:
		if k in auto:
			con.execute("INSERT OR REPLACE INTO building_settings(key,value,updated_at) VALUES(?,?,datetime('now'))",
				(mapping[key], "true" if auto[k] else "false"))
	for k, key in [("a", "note.a"), ("b", "note.b"), ("c", "note.c")]:
		if k in note:
			con.execute("INSERT OR REPLACE INTO building_settings(key,value,updated_at) VALUES(?,?,datetime('now'))",
				(mapping[key], "true" if note[k] else "false"))
	con.commit(); con.close()
	return jsonify({"ok": True})

@app.get("/api/activity")
def activity():
	con = db()
	rows = jrows(con.execute("SELECT title, kind, ts, severity FROM alerts ORDER BY ts DESC LIMIT 40"))
	con.close()
	feed = [{"title": r["title"], "meta": f"{r['kind']} · {r['severity']}", "time": str(r["ts"])[:16].replace("T", " ")} for r in rows]
	return jsonify({"feed": feed})

# --- Admin SQLite viewer (demo) ---
ALLOWED_TABLES = {
	"sensors", "readings_hourly", "readings_daily", "natural_gas", "alerts",
	"dsm_recommendations", "forecasts", "ml_models", "users", "building_settings", "energy_daily",
}

@app.get("/api/admin/db")
def admin_db_info():
	con = db()
	tables = []
	for name in sorted(ALLOWED_TABLES):
		try:
			n = con.execute(f"SELECT COUNT(*) FROM {name}").fetchone()[0]
		except Exception:
			n = 0
		tables.append({"name": name, "rows": n})
	sz = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0
	bak = DB_PATH + ".bak"
	con.close()
	return jsonify({
		"engine": "SQLite3",
		"path": DB_PATH,
		"size_mb": round(sz / (1024 * 1024), 2),
		"backup_exists": os.path.exists(bak),
		"backup_path": bak if os.path.exists(bak) else None,
		"tables": tables,
		"note": "Live warehouse — Approve/Dismiss DSM updates dsm_recommendations in place. Settings → Reset demo DB restores backup.",
	})

@app.get("/api/admin/table/<table>")
def admin_table(table):
	if table not in ALLOWED_TABLES:
		return jsonify({"error": "table not allowed"}), 400
	limit = min(request.args.get("limit", default=50, type=int), 200)
	offset = max(request.args.get("offset", default=0, type=int), 0)
	order = request.args.get("order", default="")
	con = db()
	cols = [r[1] for r in con.execute(f"PRAGMA table_info({table})").fetchall()]
	total = con.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]
	# sensible default sort for demo tables
	order_sql = ""
	if order and order.lstrip("-") in cols:
		order_sql = f" ORDER BY {order.lstrip('-')} {'DESC' if order.startswith('-') else 'ASC'}"
	elif table == "dsm_recommendations" and "id" in cols:
		order_sql = " ORDER BY id DESC"
	elif table == "alerts" and "ts" in cols:
		order_sql = " ORDER BY ts DESC"
	elif table == "readings_hourly" and "ts" in cols:
		order_sql = " ORDER BY ts DESC"
	elif table == "forecasts" and "ts" in cols:
		order_sql = " ORDER BY ts DESC"
	elif table == "energy_daily" and "day" in cols:
		order_sql = " ORDER BY day DESC"
	elif "id" in cols:
		order_sql = " ORDER BY id DESC"
	rows = jrows(con.execute(f"SELECT * FROM {table}{order_sql} LIMIT ? OFFSET ?", (limit, offset)).fetchall())
	# stringify for UI
	for r in rows:
		for k, v in list(r.items()):
			if v is None: r[k] = "NULL"
			elif isinstance(v, float): r[k] = round(v, 4)
	con.close()
	return jsonify({"table": table, "columns": cols, "total": total, "limit": limit, "offset": offset, "rows": rows})

BAK_PATH = DB_PATH + ".bak"

@app.post("/api/admin/reset-demo")
def admin_reset_demo():
	"""Restore aris.db from aris.db.bak (Pending DSM + full historian snapshot)."""
	import shutil, time
	if not os.path.exists(BAK_PATH):
		return jsonify({"error": "backup missing", "path": BAK_PATH}), 404
	# close any WAL by checkpointing if live db exists
	if os.path.exists(DB_PATH):
		try:
			con = sqlite3.connect(DB_PATH)
			con.execute("PRAGMA wal_checkpoint(TRUNCATE)")
			con.close()
		except Exception:
			pass
		time.sleep(0.05)
	shutil.copy2(BAK_PATH, DB_PATH)
	# drop sidecar WAL/SHM so readers see restored file
	for ext in ("-wal", "-shm"):
		p = DB_PATH + ext
		if os.path.exists(p):
			try: os.remove(p)
			except Exception: pass
	# verify DSM pending
	con = sqlite3.connect(DB_PATH)
	pending = con.execute("SELECT COUNT(*) FROM dsm_recommendations WHERE status='Pending'").fetchone()[0]
	total = con.execute("SELECT COUNT(*) FROM dsm_recommendations").fetchone()[0]
	con.close()
	return jsonify({"ok": True, "restored_from": BAK_PATH, "dsm_pending": pending, "dsm_total": total})

@app.post("/api/admin/save-backup")
def admin_save_backup():
	"""Overwrite backup with current live DB (optional — after staging a clean demo state)."""
	import shutil
	if not os.path.exists(DB_PATH):
		return jsonify({"error": "no live db"}), 404
	try:
		con = sqlite3.connect(DB_PATH)
		con.execute("PRAGMA wal_checkpoint(TRUNCATE)")
		con.close()
	except Exception:
		pass
	shutil.copy2(DB_PATH, BAK_PATH)
	return jsonify({"ok": True, "backup": BAK_PATH, "size_mb": round(os.path.getsize(BAK_PATH) / (1024 * 1024), 2)})

if __name__ == "__main__":
	print("ARIS API on http://127.0.0.1:5050  db=", DB_PATH)
	app.run(host="0.0.0.0", port=5050, debug=True)
