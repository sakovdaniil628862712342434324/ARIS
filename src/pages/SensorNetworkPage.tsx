import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";

interface Props { onOpenSensor?: (tag: string) => void }

export function SensorNetworkPage({ onOpenSensor }: Props) {
	const [data, setData] = useState(null as any);
	const [err, setErr] = useState("");
	useEffect(() => {
		api.sensors().then(setData).catch((e) => setErr(String(e.message || e)));
	}, []);
	if (err) return <View style={styles.wrap}><Text style={styles.title}>Sensor Network</Text><Text style={styles.sub}>{err}</Text></View>;
	if (!data) return <View style={[styles.wrap, { padding: 40 }]}><ActivityIndicator color={colors.primary} /></View>;
	return (
		<View style={styles.wrap}>
			<Text style={styles.title}>Sensor Network</Text>
			<Text style={styles.sub}>GBTAC Solar Lab inventory · live readings from SQLite historian</Text>
			<View style={styles.kpis}>
				{(data.kpis || []).map(([l, v]: string[]) => (
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
						{["SENSOR TAG", "TYPE", "ZONE", "READING", "LAST SEEN", "STATUS"].map((h) => (
							<Text key={h} style={[styles.th, h === "SENSOR TAG" && { flex: 1.6 }]}>{h}</Text>
						))}
					</View>
					{(data.sensors || []).slice(0, 80).map((s: any) => (
						<Pressable key={s.tag} style={styles.tr} onPress={() => onOpenSensor?.(s.tag)}>
							<Text style={[styles.td, { flex: 1.6, color: colors.primary }]} numberOfLines={1}>{s.name || s.tag}</Text>
							<Text style={styles.td}>{s.type}</Text>
							<Text style={styles.td}>{s.zone}</Text>
							<Text style={styles.td}>{s.reading}</Text>
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
							{(data.zoneBars || []).map((h: number, i: number) => (
								<View key={i} style={styles.zoneCol}>
									<View style={[styles.zoneFill, { height: `${h}%` as any }]} />
									<Text style={styles.zoneLbl}>{(data.zoneLabels || [])[i] || `Z${i + 1}`}</Text>
								</View>
							))}
						</View>
					</View>
					<View style={styles.card}>
						<Text style={styles.cardTitle}>By Category</Text>
						{(data.categoryBars || []).map(([label, pct]: [string, number]) => (
							<View key={label} style={{ marginTop: 8 }}>
								<Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.navy }}>{label}</Text>
								<View style={{ height: 8, backgroundColor: "#e9ecef", borderRadius: 4, marginTop: 4 }}>
									<View style={{ width: `${Math.min(100, pct * 100)}%` as any, height: 8, backgroundColor: colors.primary, borderRadius: 4 }} />
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
	wrap: { gap: 14 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -6 },
	kpis: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
	kpi: { flex: 1, minWidth: 120, backgroundColor: "#fff", borderRadius: 12, padding: 16, ...cardShadow() },
	kpiLabel: { fontFamily: fonts.medium, fontSize: 11, color: "rgba(12,35,64,0.7)" },
	kpiValue: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 26, color: colors.navy, marginTop: 4 },
	row: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 15, color: colors.navy, marginBottom: 8 },
	thead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#dee2e6", paddingBottom: 8 },
	th: { flex: 1, fontFamily: fonts.semibold, fontSize: 10, color: "#212529" },
	tr: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f3f5" },
	td: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: "#212529" },
	badge: { flex: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, alignItems: "center" },
	badgeText: { fontFamily: fonts.medium, fontSize: 11 },
	bOnline: { backgroundColor: "rgba(0,94,184,0.1)" },
	bWarn: { backgroundColor: "rgba(111,66,193,0.12)" },
	bOffline: { backgroundColor: "rgba(220,53,69,0.1)" },
	zoneBars: { flexDirection: "row", height: 100, alignItems: "flex-end", gap: 8 },
	zoneCol: { flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center" },
	zoneFill: { width: "70%", backgroundColor: colors.cyan, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
	zoneLbl: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted, marginTop: 4 },
});
