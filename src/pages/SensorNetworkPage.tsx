import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

const SENSORS = [
	{ tag: "HRV1_1_TEMP_100", type: "Temperature", zone: "Zone 1", reading: "21.4 °C", battery: "94%", seen: "12s ago", status: "Online" },
	{ tag: "HRV1_2_HUM_101", type: "Humidity", zone: "Zone 1", reading: "42 %RH", battery: "88%", seen: "18s ago", status: "Online" },
	{ tag: "HRV1_3_AIRF_102", type: "Airflow", zone: "Zone 3", reading: "182 CFM", battery: "76%", seen: "9s ago", status: "Warning" },
	{ tag: "SLAB_ZN2_PRES_44", type: "Pressure", zone: "Zone 2", reading: "—", battery: "12%", seen: "47m ago", status: "Offline" },
	{ tag: "AHU2_CO2_210", type: "CO2", zone: "Zone 2", reading: "812 ppm", battery: "91%", seen: "21s ago", status: "Online" },
	{ tag: "HRV2_1_TEMP_200", type: "Temperature", zone: "Zone 4", reading: "22.1 °C", battery: "67%", seen: "15s ago", status: "Online" },
];

interface Props {
	onOpenSensor?: (tag: string) => void;
}

export function SensorNetworkPage({ onOpenSensor }: Props) {
	return (
		<View style={styles.wrap}>
			<Text style={styles.title}>Sensor Network</Text>
			<Text style={styles.sub}>Full inventory of deployed field sensors and their live status</Text>
			<View style={styles.kpis}>
				{[
					["TOTAL", "154"],
					["ONLINE", "147"],
					["WARNING", "5"],
					["OFFLINE", "2"],
				].map(([l, v]) => (
					<View key={l} style={styles.kpi}>
						<Text style={styles.kpiLabel}>{l}</Text>
						<Text style={styles.kpiValue}>{v}</Text>
					</View>
				))}
			</View>
			<View style={styles.row}>
				<View style={[styles.card, { flex: 2 }]}>
					<Text style={styles.cardTitle}>Sensor Inventory</Text>
					<View style={styles.thead}>
						{["SENSOR TAG", "TYPE", "ZONE", "READING", "BATTERY", "LAST SEEN", "STATUS"].map((h) => (
							<Text key={h} style={[styles.th, h === "SENSOR TAG" && { flex: 1.4 }]}>
								{h}
							</Text>
						))}
					</View>
					{SENSORS.map((s) => (
						<Pressable key={s.tag} style={styles.tr} onPress={() => onOpenSensor?.(s.tag)}>
							<Text style={[styles.td, { flex: 1.4, color: colors.primary }]}>{s.tag}</Text>
							<Text style={styles.td}>{s.type}</Text>
							<Text style={styles.td}>{s.zone}</Text>
							<Text style={styles.td}>{s.reading}</Text>
							<Text style={styles.td}>{s.battery}</Text>
							<Text style={styles.td}>{s.seen}</Text>
							<View style={[styles.badge, s.status === "Online" ? styles.bOnline : s.status === "Warning" ? styles.bWarn : styles.bOffline]}>
								<Text style={[styles.badgeText, s.status === "Online" ? { color: colors.primary } : s.status === "Warning" ? { color: "#6f42c1" } : { color: colors.danger }]}>{s.status}</Text>
							</View>
						</Pressable>
					))}
				</View>
				<View style={{ flex: 1, gap: 16, minWidth: 220 }}>
					<View style={[styles.card, { minHeight: 160 }]}>
						<Text style={styles.cardTitle}>Zone Distribution</Text>
						<View style={styles.zoneBars}>
							{[70, 55, 85, 40].map((h, i) => (
								<View key={i} style={styles.zoneCol}>
									<View style={[styles.zoneFill, { height: `${h}%` as any }]} />
									<Text style={styles.zoneLbl}>Z{i + 1}</Text>
								</View>
							))}
						</View>
					</View>
					<View style={styles.card}>
						<Text style={styles.cardTitle}>By Category</Text>
						{[
							["Temperature", 0.72],
							["Humidity", 0.85],
							["Airflow", 0.64],
							["Pressure", 0.41],
						].map(([label, pct]) => (
							<View key={String(label)} style={styles.catRow}>
								<Text style={styles.catLabel}>{label}</Text>
								<View style={styles.barTrack}>
									<View style={[styles.barFill, { width: `${(pct as number) * 100}%` as any }]} />
								</View>
							</View>
						))}
					</View>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 16 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -8 },
	kpis: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
	kpi: { flex: 1, minWidth: 120, backgroundColor: "#fff", borderRadius: 12, padding: 16, ...cardShadow() },
	kpiLabel: { fontFamily: fonts.medium, fontSize: 11, color: "rgba(12,35,64,0.7)" },
	kpiValue: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy, marginTop: 4 },
	row: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, gap: 10, flex: 1, minWidth: 280, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 16, color: colors.navy },
	thead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
	th: { flex: 1, fontFamily: fonts.semibold, fontWeight: "600", fontSize: 10, color: colors.text },
	tr: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.06)", ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
	td: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.text },
	badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
	bOnline: { backgroundColor: "rgba(0,94,184,0.12)" },
	bWarn: { backgroundColor: "rgba(111,66,193,0.12)" },
	bOffline: { backgroundColor: "rgba(220,53,69,0.12)" },
	badgeText: { fontFamily: fonts.medium, fontSize: 11 },
	zoneBars: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 8 },
	zoneCol: { flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center" },
	zoneFill: { width: "70%", backgroundColor: "rgba(0,163,224,0.45)", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
	zoneLbl: { fontSize: 10, color: colors.muted, marginTop: 4, fontFamily: fonts.regular },
	catRow: { gap: 4, marginTop: 6 },
	catLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.text },
	barTrack: { height: 8, backgroundColor: colors.bg, borderRadius: 4, overflow: "hidden" },
	barFill: { height: "100%", backgroundColor: colors.cyan, borderRadius: 4 },
});
