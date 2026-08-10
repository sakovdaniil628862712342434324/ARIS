const API_BASE = (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_ARIS_API) || "http://127.0.0.1:5050";

async function get(path) {
	const r = await fetch(`${API_BASE}${path}`);
	if (!r.ok) throw new Error(`${path} ${r.status}`);
	return r.json();
}

async function post(path, body) {
	const r = await fetch(`${API_BASE}${path}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!r.ok) throw new Error(`${path} ${r.status}`);
	return r.json();
}

export const api = {
	base: API_BASE,
	health: () => get("/api/health"),
	dashboard: () => get("/api/dashboard"),
	sensors: () => get("/api/sensors"),
	sensor: (tag) => get(`/api/sensors/${encodeURIComponent(tag)}`),
	analytics: () => get("/api/analytics"),
	dsm: () => get("/api/dsm"),
	dsmAct: (id, action) => post(`/api/dsm/${id}/${action}`),
	reports: () => get("/api/reports"),
	settings: () => get("/api/settings"),
	saveSettings: (body) => post("/api/settings", body),
	activity: () => get("/api/activity"),
	adminDb: () => get("/api/admin/db"),
	adminTable: (table, limit = 50, offset = 0) => get(`/api/admin/table/${encodeURIComponent(table)}?limit=${limit}&offset=${offset}`),
	resetDemoDb: () => post("/api/admin/reset-demo"),
	saveBackup: () => post("/api/admin/save-backup"),
};
