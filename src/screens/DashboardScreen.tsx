import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, SafeAreaView, useWindowDimensions, Platform, Alert } from "react-native";
import { fonts } from "../theme/fonts";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { RootStackParamList } from "../types";

const SENSOR_ROWS = [
	{ cat: "Temperature", online: 35, warn: 1, offline: 0 },
	{ cat: "Humidity", online: 52, warn: 0, offline: 1 },
	{ cat: "Airflow", online: 44, warn: 0, offline: 0 },
	{ cat: "Pressure", online: 16, warn: 4, offline: 1 },
];

const ALERTS = [
	{ title: "HRV1 Damper Pull Warning", time: "Today at 3:37 PM" },
	{ title: "New DSM Recommendation Generated", time: "Today at 9:07 PM" },
	{ title: "New DSM Model Retrained", time: "Today at 6:12 AM" },
	{ title: "Zone 2 Pressure Sensor Offline", time: "Yesterday at 11:42 PM" },
];

const INITIAL_APPROVALS = [
	{ id: "a1", title: "Adjust Slab Zn2 Setpoint → 21.5°C", sent: "Sent 12h ago", impact: "−4.2 kWh/day" },
	{ id: "a2", title: "Adjust Slab Zn2 Setpoint → 20.0°C", sent: "Sent 1d ago", impact: "−2.1 kWh/day" },
];

const PAGE_COPY: Partial<Record<keyof RootStackParamList, { title: string; subtitle: string }>> = {
	Dashboard: { title: "Dashboard", subtitle: "Live building intelligence · ARIS adaptive HVAC control" },
	SensorNetwork: { title: "Sensor Network", subtitle: "Inventory and live status by category and zone" },
	Analytics: { title: "Analytics & Predictions", subtitle: "ML-driven demand forecasting and model performance" },
	DSM: { title: "DSM Recommendations", subtitle: "Demand-side actions pending operator approval" },
	Reports: { title: "Reports", subtitle: "Generated operational and energy reports" },
	SystemSettings: { title: "System Settings", subtitle: "Automation, integrations, and notifications" },
};

function Sparkline() {
	const pts = [8, 14, 10, 18, 16, 22, 20, 28, 24, 30];
	return (
		<View style={styles.sparkline}>
			{pts.map((h, i) => (
				<View key={i} style={[styles.sparkBar, { height: h }]} />
			))}
		</View>
	);
}

function Donut() {
	return (
		<View style={styles.donutWrap}>
			<View style={styles.donutOuter}>
				<View style={styles.donutHole}>
					<Text style={styles.donutValue}>147</Text>
					<Text style={styles.donutLabel}>online</Text>
				</View>
			</View>
		</View>
	);
}

function AreaChart({ tall }: { tall?: boolean }) {
	const heights = [40, 55, 48, 70, 62, 85, 78, 92, 70, 88, 75, 95];
	return (
		<View style={[styles.chart, tall && { height: 160 }]}>
			{heights.map((h, i) => (
				<View key={i} style={styles.chartCol}>
					<View style={[styles.chartFill, { height: `${h}%` as any }]} />
				</View>
			))}
		</View>
	);
}

interface Props {
	onSignOut?: () => void;
}

export function DashboardScreen({ onSignOut }: Props) {
	const { width } = useWindowDimensions();
	const compact = width < 900;
	const [nav, setNav] = useState<keyof RootStackParamList>("Dashboard");
	const [approvals, setApprovals] = useState(INITIAL_APPROVALS);
	const page = useMemo(() => PAGE_COPY[nav] || PAGE_COPY.Dashboard!, [nav]);
	const resolve = (id: string, action: "approved" | "dismissed") => {
		setApprovals((list) => list.filter((a) => a.id !== id));
		Alert.alert(action === "approved" ? "Approved" : "Dismissed", `Control request ${action}.`);
	};

	return (
		<SafeAreaView style={styles.safe}>
			<View style={styles.container}>
				{!compact && <Sidebar currentScreen={nav} onNavigate={setNav} />}
				<View style={styles.main}>
					<TopBar
						onUserPress={onSignOut}
						onSearchPress={() => Alert.alert("Global Search", "Search sensors, alerts, DSM, and reports.")}
						onNotificationsPress={() => Alert.alert("Notifications", "3 unread alerts · HRV1 damper, Zone 2 offline, DSM ready.")}
					/>
					<ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
						<View style={styles.header}>
							<Text style={styles.title}>{page.title}</Text>
							<Text style={styles.subtitle}>{page.subtitle}</Text>
						</View>

						<View style={[styles.row, compact && styles.col]}>
							{[
								{ label: "Active Sensors", value: "98%" },
								{ label: "System Health", value: "Excellent" },
								{ label: "Energy Savings Today", value: "14 kWh" },
							].map((k) => (
								<View key={k.label} style={[styles.statCard, compact && styles.full]}>
									<Text style={styles.statLabel}>{k.label}</Text>
									<Text style={styles.statValue}>{k.value}</Text>
									<Sparkline />
								</View>
							))}
						</View>

						<View style={[styles.row, compact && styles.col]}>
							<View style={[styles.card, styles.half, compact && styles.full]}>
								<Text style={styles.cardTitle}>Sensor Network Overview</Text>
								<Text style={styles.cardSubtitle}>Summarized status by sensor category</Text>
								<View style={styles.sensorBody}>
									<View style={styles.sensorTable}>
										<View style={styles.tableHeader}>
											{["Category", "ONLINE", "WARN", "OFFLINE"].map((h) => (
												<Text key={h} style={[styles.columnHeader, h === "Category" && { flex: 1.4, textAlign: "left" }]}>
													{h}
												</Text>
											))}
										</View>
										{SENSOR_ROWS.map((r) => (
											<View key={r.cat} style={styles.tableRow}>
												<Text style={[styles.cellText, { flex: 1.4 }]}>{r.cat}</Text>
												<Text style={styles.cellValue}>{r.online}</Text>
												<Text style={[styles.cellValue, r.warn ? styles.warn : null]}>{r.warn}</Text>
												<Text style={[styles.cellValue, r.offline ? styles.offline : null]}>{r.offline}</Text>
											</View>
										))}
									</View>
									<Donut />
								</View>
							</View>
							<View style={[styles.card, styles.half, compact && styles.full]}>
								<Text style={styles.cardTitle}>Real-time Data Trends</Text>
								<Text style={styles.cardSubtitle}>Last 24 hours · multi-series</Text>
								<AreaChart tall />
							</View>
						</View>

						<View style={[styles.row, compact && styles.col]}>
							<View style={[styles.card, styles.half, compact && styles.full]}>
								<Text style={styles.cardTitle}>Building Sensor Map</Text>
								<Text style={styles.cardSubtitle}>Isometric zone view · live sensor telemetry</Text>
								<View style={styles.mapGrid}>
									{["Zone 1", "Zone 2", "Zone 3", "Zone 4"].map((z) => (
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
								<Text style={styles.cardTitle}>Predictive Analytics & DSM Recommendations</Text>
								<Text style={styles.cardSubtitle}>Forecasted demand — next 6 hours</Text>
								<AreaChart tall />
								<Text style={styles.forecastNote}>Model output from Linear Regression · confidence band ±8% · retrained 6h ago</Text>
							</View>
						</View>

						<View style={[styles.row, compact && styles.col]}>
							<View style={[styles.card, styles.half, compact && styles.full]}>
								<Text style={styles.cardTitle}>System Alerts & Activity Feed</Text>
								{ALERTS.map((a) => (
									<View key={a.title} style={styles.alertItem}>
										<View style={styles.alertDot} />
										<View style={styles.alertContent}>
											<Text style={styles.alertTitle}>{a.title}</Text>
											<Text style={styles.alertTime}>{a.time}</Text>
										</View>
									</View>
								))}
							</View>
							<View style={[styles.card, styles.half, compact && styles.full]}>
								<Text style={styles.cardTitle}>Pending Controls & Approvals</Text>
								{approvals.length === 0 ? <Text style={styles.cardSubtitle}>No pending approvals</Text> : null}
								{approvals.map((a) => (
									<View key={a.id} style={styles.approvalCard}>
										<Text style={styles.approvalEyebrow}>Manual Override Request</Text>
										<Text style={styles.approvalTitle}>{a.title}</Text>
										<Text style={styles.approvalSent}>{a.sent}</Text>
										<Text style={styles.approvalImpact}>Impact: {a.impact}</Text>
										<View style={styles.approvalActions}>
											<Pressable style={styles.approveButton} accessibilityRole="button" onPress={() => resolve(a.id, "approved")}>
												<Text style={styles.approveText}>Approve</Text>
											</Pressable>
											<Pressable style={styles.dismissButton} accessibilityRole="button" onPress={() => resolve(a.id, "dismissed")}>
												<Text style={styles.dismissText}>Dismiss</Text>
											</Pressable>
										</View>
									</View>
								))}
							</View>
						</View>
					</ScrollView>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#f6f7f9" },
	container: { flex: 1, flexDirection: "row" },
	main: { flex: 1, backgroundColor: "#f6f7f9", minWidth: 0 },
	content: { flex: 1 },
	contentInner: { paddingHorizontal: 24, paddingVertical: 20, gap: 16, paddingBottom: 40 },
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
	sparkline: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 32 },
	sparkBar: { width: 6, borderRadius: 2, backgroundColor: "#00a3e0", opacity: 0.85 },
	card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, gap: 10, ...(Platform.OS === "web" ? { boxShadow: "0px 4px 8px rgba(0,0,0,0.1)" } : { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }) },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 17, color: "#0c2340" },
	cardSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: "#6c757d", marginTop: -4 },
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
	chart: { height: 140, flexDirection: "row", alignItems: "flex-end", gap: 4, backgroundColor: "rgba(0, 163, 224, 0.04)", borderRadius: 8, padding: 8 },
	chartCol: { flex: 1, height: "100%", justifyContent: "flex-end" },
	chartFill: { width: "100%", backgroundColor: "rgba(0, 94, 184, 0.35)", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
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
