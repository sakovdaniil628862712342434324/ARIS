import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform, Alert, useWindowDimensions, ActivityIndicator } from "react-native";
import { fonts } from "../theme/fonts";
import { api } from "../services/api";
import { Sparkline, AreaChart, DualAreaChart } from "../components/ui/Charts";

interface Props {
	onOpenActivity?: () => void;
	onOpenSensor?: () => void;
}

export function DashboardPage({ onOpenActivity, onOpenSensor }: Props) {
	const { width } = useWindowDimensions();
	const compact = width < 900;
	const [data, setData] = useState(null as any);
	const [err, setErr] = useState("");
	const [approvals, setApprovals] = useState([] as any[]);
	const load = () => {
		api.dashboard().then((d) => { setData(d); setApprovals(d.approvals || []); setErr(""); }).catch((e) => setErr(String(e.message || e)));
	};
	useEffect(() => { load(); }, []);
	const resolve = async (id: string, action: "approved" | "dismissed") => {
		try {
			await api.dsmAct(id, action === "approved" ? "approve" : "dismiss");
			setApprovals((list) => list.filter((a) => a.id !== id));
			Alert.alert(action === "approved" ? "Approved" : "Dismissed", `Logged locally (historian mode — no BMS write-back).`);
		} catch (e: any) {
			Alert.alert("Error", String(e.message || e));
		}
	};
	if (err) return (
		<View style={styles.wrap}>
			<Text style={styles.title}>Dashboard Overview</Text>
			<Text style={styles.subtitle}>API offline — start backend on :5050 ({err})</Text>
			<Pressable style={styles.approveButton} onPress={load}><Text style={styles.approveText}>Retry</Text></Pressable>
		</View>
	);
	if (!data) return <View style={[styles.wrap, { padding: 40 }]}><ActivityIndicator color="#005eb8" /></View>;
	const kpis = data.kpis || [];
	const rows = data.sensorRows || [];
	return (
		<View style={styles.wrap}>
			<View style={styles.header}>
				<Text style={styles.title}>Dashboard Overview</Text>
				<Text style={styles.subtitle}>{data.subtitle || "GBTAC historian · SQLite + PyTorch"}</Text>
			</View>
			<View style={[styles.row, compact && styles.col]}>
				{kpis.map((k: any) => (
					<View key={k.label} style={[styles.statCard, compact && styles.full]}>
						<Text style={styles.statLabel}>{k.label}</Text>
						<Text style={styles.statValue}>{k.value}</Text>
						<Sparkline pts={k.spark || []} color="#00a3e0" />
					</View>
				))}
			</View>
			<View style={[styles.row, compact && styles.col]}>
				<View style={[styles.card, styles.half, compact && styles.full]}>
					<Text style={styles.cardTitle}>Sensor Network Overview</Text>
					<Text style={styles.cardSubtitle}>Status by category · real GBTAC points</Text>
					<View style={styles.sensorBody}>
						<View style={styles.sensorTable}>
							<View style={styles.tableHeader}>
								{["Category", "ONLINE", "WARN", "OFFLINE"].map((h) => (
									<Text key={h} style={[styles.columnHeader, h === "Category" && { flex: 1.4, textAlign: "left" }]}>{h}</Text>
								))}
							</View>
							{rows.map((r: any) => (
								<View key={r.cat} style={styles.tableRow}>
									<Text style={[styles.cellText, { flex: 1.4 }]}>{r.cat}</Text>
									<Text style={styles.cellValue}>{r.online}</Text>
									<Text style={[styles.cellValue, r.warn ? styles.warn : null]}>{r.warn}</Text>
									<Text style={[styles.cellValue, r.offline ? styles.offline : null]}>{r.offline}</Text>
								</View>
							))}
						</View>
						<View style={styles.donutWrap}>
							<View style={styles.donutOuter}>
								<View style={styles.donutHole}>
									<Text style={styles.donutValue}>{data.onlineCount ?? 0}</Text>
									<Text style={styles.donutLabel}>online</Text>
								</View>
							</View>
						</View>
					</View>
				</View>
				<View style={[styles.card, styles.half, compact && styles.full]}>
					<Text style={styles.cardTitle}>HVAC Load Trends</Text>
					<Text style={styles.cardSubtitle}>Hourly Space HVAC (W) · historian</Text>
					<AreaChart heights={data.trendHeights || []} tall />
				</View>
			</View>
			<View style={[styles.row, compact && styles.col]}>
				<View style={[styles.card, styles.half, compact && styles.full]}>
					<Text style={styles.cardTitle}>Building Zones</Text>
					<Text style={styles.cardSubtitle}>From sensor location tags</Text>
					<View style={styles.mapGrid}>
						{(data.zones || []).map((z: string) => (
							<View key={z} style={styles.zone}>
								{[0, 1, 2, 3].map((d) => (
									<View key={d} style={[styles.sensorDot, { top: 12 + d * 14, left: 16 + (d % 2) * 40 }]} />
								))}
								<Text style={styles.zoneLabel}>{z}</Text>
							</View>
						))}
					</View>
				</View>
				<View style={[styles.card, styles.half, compact && styles.full]}>
					<Text style={styles.cardTitle}>Forecast vs Actual</Text>
					<Text style={styles.cardSubtitle}>{(data.compare && data.compare.note) || "Predicted vs actual HVAC W"}</Text>
					<DualAreaChart a={(data.compare && data.compare.predHeights) || []} b={(data.compare && data.compare.actualHeights) || data.forecastHeights || []} tall />
					<Text style={styles.forecastNote}>
						MAE {(data.compare && data.compare.maeW) ?? "—"} W · R² {(data.compare && data.compare.r2) ?? "—"} · factor {(data.emissions && data.emissions.factor) || 0.54} kg/kWh · day {data.replayDay || "—"}
					</Text>
				</View>
			</View>
			<View style={[styles.row, compact && styles.col]}>
				<View style={[styles.card, styles.half, compact && styles.full]}>
					<View style={styles.cardHead}>
						<Text style={styles.cardTitle}>System Alerts & Activity</Text>
						<Pressable onPress={onOpenActivity}><Text style={styles.link}>View all</Text></Pressable>
					</View>
					{(data.alerts || []).map((a: any) => (
						<Pressable key={a.title + a.time} style={styles.alertItem} onPress={onOpenSensor}>
							<View style={styles.alertDot} />
							<View style={styles.alertContent}>
								<Text style={styles.alertTitle}>{a.title}</Text>
								<Text style={styles.alertTime}>{a.time}</Text>
							</View>
						</Pressable>
					))}
				</View>
				<View style={[styles.card, styles.half, compact && styles.full]}>
					<Text style={styles.cardTitle}>Pending DSM Approvals</Text>
					{approvals.length === 0 ? <Text style={styles.cardSubtitle}>No pending approvals</Text> : null}
					{approvals.map((a) => (
						<View key={a.id} style={styles.approvalCard}>
							<Text style={styles.approvalEyebrow}>DSM Recommendation</Text>
							<Text style={styles.approvalTitle}>{a.title}</Text>
							<Text style={styles.approvalSent}>{a.sent}</Text>
							<Text style={styles.approvalImpact}>Impact: {a.impact}</Text>
							<View style={styles.approvalActions}>
								<Pressable style={styles.approveButton} onPress={() => resolve(a.id, "approved")}><Text style={styles.approveText}>Approve</Text></Pressable>
								<Pressable style={styles.dismissButton} onPress={() => resolve(a.id, "dismissed")}><Text style={styles.dismissText}>Dismiss</Text></Pressable>
							</View>
						</View>
					))}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 16 },
	header: { marginBottom: 4, gap: 4 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: "#0c2340" },
	subtitle: { fontFamily: fonts.regular, fontSize: 13, color: "#6c757d" },
	row: { flexDirection: "row", gap: 16 },
	col: { flexDirection: "column" },
	half: { flex: 1, minWidth: 0 },
	full: { width: "100%" },
	statCard: { flex: 1, backgroundColor: "#ffffff", borderRadius: 12, padding: 16, gap: 8, minWidth: 160, ...(Platform.OS === "web" ? { boxShadow: "0px 2px 4px rgba(0,0,0,0.08)" } : { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 }) },
	statLabel: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 12, color: "rgba(12, 35, 64, 0.7)" },
	statValue: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: "#0c2340" },
	card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, gap: 10, ...(Platform.OS === "web" ? { boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" } : { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }) },
	cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 17, color: "#0c2340" },
	cardSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: "#6c757d", marginTop: -4 },
	link: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: "#005eb8" },
	sensorBody: { flexDirection: "row", gap: 16, alignItems: "center" },
	sensorTable: { flex: 1, gap: 4, minWidth: 0 },
	tableHeader: { flexDirection: "row", paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#dee2e6", marginBottom: 4 },
	columnHeader: { flex: 1, fontFamily: fonts.semibold, fontWeight: "600", fontSize: 11, color: "#212529", textAlign: "center" },
	tableRow: { flexDirection: "row", paddingVertical: 7 },
	cellText: { flex: 1, fontFamily: fonts.regular, fontSize: 13, color: "#212529" },
	cellValue: { flex: 1, fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: "#212529", textAlign: "center" },
	warn: { color: "#d39e00" },
	offline: { color: "#dc3545" },
	donutWrap: { width: 110, height: 110, alignItems: "center", justifyContent: "center" },
	donutOuter: { width: 110, height: 110, borderRadius: 55, borderWidth: 14, borderColor: "#00a3e0", borderTopColor: "#005eb8", borderRightColor: "#7ec8e3", borderBottomColor: "#c9ced6", alignItems: "center", justifyContent: "center" },
	donutHole: { alignItems: "center", justifyContent: "center" },
	donutValue: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 16, color: "#0c2340" },
	donutLabel: { fontFamily: fonts.regular, fontSize: 10, color: "#6c757d" },
	mapGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	zone: { width: "48%", height: 88, backgroundColor: "rgba(12, 35, 64, 0.04)", borderRadius: 8, borderWidth: 1, borderColor: "rgba(12, 35, 64, 0.12)", position: "relative", justifyContent: "flex-end", padding: 8 },
	sensorDot: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#00a3e0" },
	zoneLabel: { fontFamily: fonts.medium, fontSize: 11, color: "#6c757d" },
	forecastNote: { fontFamily: fonts.regular, fontSize: 11, color: "#6c757d", fontStyle: "italic" },
	alertItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
	alertDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(120, 90, 200, 0.85)" },
	alertContent: { flex: 1 },
	alertTitle: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: "#212529" },
	alertTime: { fontFamily: fonts.regular, fontSize: 11, color: "#6c757d", marginTop: 2 },
	approvalCard: { backgroundColor: "rgba(0, 163, 224, 0.06)", borderRadius: 10, padding: 14, gap: 4, marginTop: 4 },
	approvalEyebrow: { fontFamily: fonts.medium, fontSize: 11, color: "#6c757d" },
	approvalTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 14, color: "#0c2340" },
	approvalSent: { fontFamily: fonts.regular, fontSize: 11, color: "#6c757d" },
	approvalImpact: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 12, color: "#005eb8", marginTop: 2 },
	approvalActions: { flexDirection: "row", gap: 10, marginTop: 8 },
	approveButton: { backgroundColor: "#005eb8", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
	approveText: { fontFamily: fonts.semibold, fontWeight: "600", fontSize: 13, color: "#ffffff" },
	dismissButton: { backgroundColor: "transparent", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: "#dee2e6" },
	dismissText: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: "#0c2340" },
});
