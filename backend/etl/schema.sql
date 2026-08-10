PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS sensors (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	source_code TEXT NOT NULL UNIQUE,
	full_name TEXT,
	report_name TEXT,
	description TEXT,
	property_code INTEGER,
	controller TEXT,
	sensor_type TEXT NOT NULL DEFAULT 'analog',
	unit TEXT NOT NULL DEFAULT '',
	zone TEXT NOT NULL DEFAULT 'Building',
	active INTEGER NOT NULL DEFAULT 1,
	in_timeseries INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS readings_hourly (
	sensor_id INTEGER NOT NULL REFERENCES sensors(id),
	ts TEXT NOT NULL,
	value REAL NOT NULL,
	n INTEGER NOT NULL DEFAULT 1,
	PRIMARY KEY (sensor_id, ts)
);

CREATE TABLE IF NOT EXISTS readings_daily (
	sensor_id INTEGER NOT NULL REFERENCES sensors(id),
	day TEXT NOT NULL,
	value REAL NOT NULL,
	n INTEGER NOT NULL DEFAULT 1,
	PRIMARY KEY (sensor_id, day)
);

CREATE TABLE IF NOT EXISTS natural_gas (
	day TEXT PRIMARY KEY,
	meter_reading REAL,
	gj_usage REAL
);

CREATE TABLE IF NOT EXISTS alerts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	sensor_id INTEGER REFERENCES sensors(id),
	severity TEXT NOT NULL DEFAULT 'medium',
	kind TEXT NOT NULL,
	title TEXT NOT NULL,
	message TEXT NOT NULL,
	ts TEXT NOT NULL,
	acked INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS dsm_recommendations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	zone TEXT NOT NULL,
	action TEXT NOT NULL,
	reason TEXT NOT NULL,
	impact_kwh REAL NOT NULL DEFAULT 0,
	confidence REAL NOT NULL DEFAULT 0.8,
	priority TEXT NOT NULL DEFAULT 'Medium',
	status TEXT NOT NULL DEFAULT 'Pending',
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	decided_at TEXT
);

CREATE TABLE IF NOT EXISTS forecasts (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	metric TEXT NOT NULL DEFAULT 'site_kw',
	ts TEXT NOT NULL,
	yhat REAL NOT NULL,
	actual REAL,
	horizon_h INTEGER NOT NULL DEFAULT 1,
	model_id INTEGER,
	UNIQUE(metric, ts, horizon_h)
);

CREATE TABLE IF NOT EXISTS ml_models (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	kind TEXT NOT NULL,
	path TEXT NOT NULL,
	metrics_json TEXT,
	trained_at TEXT NOT NULL DEFAULT (datetime('now')),
	active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	display_name TEXT,
	role TEXT NOT NULL DEFAULT 'operator',
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS building_settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS energy_daily (
	day TEXT PRIMARY KEY,
	hvac_kwh REAL NOT NULL DEFAULT 0,
	lighting_kwh REAL NOT NULL DEFAULT 0,
	dhw_kwh REAL NOT NULL DEFAULT 0,
	rnd_kwh REAL NOT NULL DEFAULT 0,
	appliances_kwh REAL NOT NULL DEFAULT 0,
	pv_carport_kw REAL NOT NULL DEFAULT 0,
	pv_rooftop_kw REAL NOT NULL DEFAULT 0,
	site_kw REAL NOT NULL DEFAULT 0,
	net_kw REAL NOT NULL DEFAULT 0,
	gas_gj REAL,
	emissions_kg REAL
);

CREATE INDEX IF NOT EXISTS idx_rh_ts ON readings_hourly(ts);
CREATE INDEX IF NOT EXISTS idx_rd_day ON readings_daily(day);
CREATE INDEX IF NOT EXISTS idx_alerts_ts ON alerts(ts DESC);
