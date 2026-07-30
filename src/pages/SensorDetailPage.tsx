import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

interface Props {
	sensorId?: string;
	onBack?: () => void;
	onOpenDSM?: () => void;
	onOpenNetwork?: () => void;
	onOpenDashboard?: () => void;
}

export function SensorDetailPage({ sensorId = "HRV1_3_AIRF_102", onBack, onOpenDSM, onOpenNetwork, onOpenDashboard }: Props) {
	return (
		<View style={styles.wrap}>
			<Pressable onPress={onBack}>
				<Text style={styles.back}>← Back</Text>
			</Pressable>
			<Text style={styles.title}>{sensorId}</Text>
			<Text style={styles.sub}>Airflow · Zone 3 · live telemetry</Text>
			<View style={styles.kpis}>
				{[
					["STATUS", "Warning"],
					["AIRFLOW", "182 CFM"],
					["DAMPER", "85%"],
					["LAST MOD", "Just now"],
				].map(([l, v]) => (
					<View key={l} style={styles.kpi}>
						<Text style={styles.kpiLabel}>{l}</Text>
						<Text style={[styles.kpiValue, l === "STATUS" && { color: "#6f42c1" }]}>{v}</Text>
					</View>
				))}
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Live trend</Text>
				<View style={styles.chart}>
					{[40, 48, 52, 60, 55, 70, 68, 75, 72, 80, 78, 85].map((h, i) => (
						<View key={i} style={[styles.bar, { height: h }]} />
					))}
				</View>
			</View>
			<View style={styles.actions}>
				<Pressable style={styles.btn} onPress={onOpenDSM}>
					<Text style={styles.btnText}>Open DSM</Text>
				</Pressable>
				<Pressable style={styles.btnOutline} onPress={onOpenNetwork}>
					<Text style={styles.btnOutlineText}>Sensor Network</Text>
				</Pressable>
				<Pressable style={styles.btnOutline} onPress={onOpenDashboard}>
					<Text style={styles.btnOutlineText}>Dashboard</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 14 },
	back: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -6 },
	kpis: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
	kpi: { flex: 1, minWidth: 140, backgroundColor: "#fff", borderRadius: 12, padding: 16, ...cardShadow() },
	kpiLabel: { fontFamily: fonts.medium, fontSize: 11, color: "rgba(12,35,64,0.7)" },
	kpiValue: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 22, color: colors.navy, marginTop: 4 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, gap: 12, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 16, color: colors.navy },
	chart: { height: 160, flexDirection: "row", alignItems: "flex-end", gap: 6, backgroundColor: "rgba(0,163,224,0.04)", borderRadius: 8, padding: 10 },
	bar: { flex: 1, backgroundColor: "rgba(0,94,184,0.4)", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
	actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
	btn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12 },
	btnText: { color: "#fff", fontFamily: fonts.semibold, fontWeight: "600", fontSize: 13 },
	btnOutline: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff" },
	btnOutlineText: { color: colors.navy, fontFamily: fonts.medium, fontWeight: "500", fontSize: 13 },
});
