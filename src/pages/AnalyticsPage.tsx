import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";
import { AreaChart, DualAreaChart } from "../components/ui/Charts";

export function AnalyticsPage() {
	const [data, setData] = useState(null as any);
	const [err, setErr] = useState("");
	useEffect(() => { api.analytics().then(setData).catch((e) => setErr(String(e.message || e))); }, []);
	if (err) return <View style={styles.wrap}><Text style={styles.title}>Analytics</Text><Text style={styles.sub}>{err}</Text></View>;
	if (!data) return <View style={[styles.wrap, { padding: 40 }]}><ActivityIndicator color={colors.primary} /></View>;
	const cmp = data.compare || {};
	const et = data.energyTemp || {};
	const tou = data.tou || {};
	const em = data.emissions || {};
	return (
		<View style={styles.wrap}>
			<Text style={styles.title}>Analytics & Predictions</Text>
			<Text style={styles.sub}>{data.note}</Text>
			<View style={styles.kpis}>
				{(data.kpis || []).map(([l, v]: string[]) => (
					<View key={l} style={styles.kpi}>
						<Text style={styles.kpiLabel}>{l}</Text>
						<Text style={styles.kpiValue}>{v}</Text>
					</View>
				))}
			</View>
			<View style={styles.row}>
				<View style={[styles.card, { flex: 1 }]}>
					<Text style={styles.cardTitle}>Forecast vs Actual (compare)</Text>
					<Text style={styles.cardSub}>{cmp.note || "Predicted vs actual HVAC W"}</Text>
					<DualAreaChart a={cmp.predHeights || data.predHeights || []} b={cmp.actualHeights || data.actualHeights || []} tall />
					<View style={styles.metaRow}>
						<Text style={styles.meta}>MAE {cmp.maeW ?? "—"} W</Text>
						<Text style={styles.meta}>MAPE {cmp.mapePct ?? "—"}%</Text>
						<Text style={styles.meta}>R² {cmp.r2 ?? "—"}</Text>
						<Text style={styles.meta}>n={cmp.n ?? 0}</Text>
					</View>
				</View>
				<View style={[styles.card, { flex: 1 }]}>
					<Text style={styles.cardTitle}>24h Forecast Horizon</Text>
					<AreaChart heights={data.forecastHeights || []} tall />
				</View>
			</View>
			<View style={styles.row}>
				<View style={[styles.card, { flex: 1 }]}>
					<Text style={styles.cardTitle}>Energy vs Temperature</Text>
					<Text style={styles.cardSub}>{et.note || "Outdoor °C vs HVAC W"} · r={et.correlation ?? "—"} · {et.nDays ?? 0} days</Text>
					<DualAreaChart a={et.oatHeights || []} b={et.hvacHeights || []} tall />
					<Text style={styles.legend}>Blue = outdoor temp · Cyan = HVAC load</Text>
				</View>
				<View style={[styles.card, { flex: 1 }]}>
					<Text style={styles.cardTitle}>Emissions (Alberta factor)</Text>
					<Text style={styles.cardSub}>{em.detail || `Factor ${em.factor ?? 0.54} kg/kWh`}</Text>
					<Text style={styles.emBig}>{em.label || "—"}</Text>
					<Text style={styles.legend}>Replay day {em.day || "—"} · PV avoided ~{em.avoidedKg ?? "—"} kg</Text>
				</View>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>AESO-style TOU Price Curve</Text>
				<Text style={styles.cardSub}>{tou.source || "Bundled snapshot"} · now {tou.now ? `${tou.now.period} · ${tou.now.price}¢/kWh` : "—"}</Text>
				<AreaChart heights={tou.heights || []} tall />
				<Text style={styles.legend}>{tou.suggestion || ""}</Text>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Monthly Site Load / Savings Proxy</Text>
				<View style={styles.monthRow}>
					{(data.monthBars || []).map(([m, h]: [string, number]) => (
						<View key={m} style={styles.monthCol}>
							<View style={[styles.monthBar, { height: h }]} />
							<Text style={styles.monthLbl}>{m}</Text>
						</View>
					))}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 14 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -6 },
	kpis: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
	kpi: { flex: 1, minWidth: 140, backgroundColor: "#fff", borderRadius: 12, padding: 16, ...cardShadow() },
	kpiLabel: { fontFamily: fonts.medium, fontSize: 11, color: "rgba(12,35,64,0.7)" },
	kpiValue: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 20, color: colors.navy, marginTop: 4 },
	row: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, ...cardShadow(), minWidth: 280 },
	cardTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.navy, marginBottom: 4 },
	cardSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginBottom: 4 },
	metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
	meta: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
	legend: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 8 },
	emBig: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 36, color: colors.navy, marginTop: 12 },
	monthRow: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 10, marginTop: 8 },
	monthCol: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
	monthBar: { width: "70%", backgroundColor: colors.cyan, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
	monthLbl: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 4 },
});
