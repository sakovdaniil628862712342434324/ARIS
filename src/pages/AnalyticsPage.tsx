import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

function Area() {
	const h = [40, 55, 48, 70, 62, 85, 78, 92, 70, 88, 75, 95];
	return (
		<View style={styles.chart}>
			{h.map((v, i) => (
				<View key={i} style={styles.col}>
					<View style={[styles.fill, { height: `${v}%` as any }]} />
				</View>
			))}
		</View>
	);
}

export function AnalyticsPage() {
	return (
		<View style={styles.wrap}>
			<Text style={styles.title}>Analytics & Predictions</Text>
			<Text style={styles.sub}>ML-driven demand forecasting and model performance monitoring</Text>
			<View style={styles.kpis}>
				{[
					["MODEL", "Linear Regression"],
					["PREDICTION ACCURACY", "94.2%"],
					["MAE", "18.4 kW"],
					["FORECAST HORIZON", "6 hours"],
				].map(([l, v]) => (
					<View key={l} style={styles.kpi}>
						<Text style={styles.kpiLabel}>{l}</Text>
						<Text style={styles.kpiValue}>{v}</Text>
					</View>
				))}
			</View>
			<View style={styles.row}>
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Predicted vs. Actual Demand</Text>
					<Area />
				</View>
				<View style={styles.card}>
					<Text style={styles.cardTitle}>Forecasted Demand</Text>
					<Area />
				</View>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Monthly Energy Savings</Text>
				<View style={styles.bars}>
					{[
						["Jan", 55],
						["Feb", 62],
						["Mar", 78],
						["Apr", 72],
						["May", 88],
						["Jun", 95],
						["Jul", 42],
					].map(([m, h]) => (
						<View key={String(m)} style={styles.barCol}>
							<View style={[styles.bar, { height: h as number }]} />
							<Text style={styles.barLbl}>{m}</Text>
						</View>
					))}
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
	kpi: { flex: 1, minWidth: 160, backgroundColor: "#fff", borderRadius: 12, padding: 16, ...cardShadow() },
	kpiLabel: { fontFamily: fonts.medium, fontSize: 11, color: "rgba(12,35,64,0.7)" },
	kpiValue: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 22, color: colors.navy, marginTop: 6 },
	row: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
	card: { flex: 1, minWidth: 280, backgroundColor: "#fff", borderRadius: 16, padding: 18, gap: 12, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 16, color: colors.navy },
	chart: { height: 160, flexDirection: "row", alignItems: "flex-end", gap: 4, backgroundColor: "rgba(0,163,224,0.04)", borderRadius: 8, padding: 8 },
	col: { flex: 1, height: "100%", justifyContent: "flex-end" },
	fill: { width: "100%", backgroundColor: "rgba(0,94,184,0.35)", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
	bars: { flexDirection: "row", alignItems: "flex-end", height: 160, gap: 10 },
	barCol: { flex: 1, alignItems: "center", justifyContent: "flex-end", height: "100%" },
	bar: { width: 36, backgroundColor: colors.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6, opacity: 0.85 },
	barLbl: { marginTop: 8, fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
});
