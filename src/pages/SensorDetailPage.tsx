import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";
import { AreaChart } from "../components/ui/Charts";

interface Props {
	sensorId?: string;
	onBack?: () => void;
	onOpenDSM?: () => void;
	onOpenNetwork?: () => void;
	onOpenDashboard?: () => void;
}

export function SensorDetailPage({ sensorId = "30000_TL208", onBack, onOpenDSM, onOpenNetwork, onOpenDashboard }: Props) {
	const [data, setData] = useState(null as any);
	const [err, setErr] = useState("");
	useEffect(() => {
		api.sensor(sensorId).then(setData).catch((e) => setErr(String(e.message || e)));
	}, [sensorId]);
	if (err) return <View style={styles.wrap}><Text style={styles.title}>{sensorId}</Text><Text style={styles.sub}>{err}</Text><Pressable onPress={onBack}><Text style={styles.link}>Back</Text></Pressable></View>;
	if (!data) return <View style={[styles.wrap, { padding: 40 }]}><ActivityIndicator color={colors.primary} /></View>;
	return (
		<View style={styles.wrap}>
			<Pressable onPress={onBack}><Text style={styles.link}>← Sensor Network</Text></Pressable>
			<Text style={styles.title}>{data.name || data.tag}</Text>
			<Text style={styles.sub}>{data.subtitle}</Text>
			<Text style={styles.tag}>{data.tag}</Text>
			<View style={styles.kpis}>
				{(data.kpis || []).map(([l, v]: string[]) => (
					<View key={l} style={styles.kpi}>
						<Text style={styles.kpiLabel}>{l}</Text>
						<Text style={styles.kpiValue}>{v}</Text>
					</View>
				))}
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Hourly historian series</Text>
				<AreaChart heights={data.heights || []} tall />
			</View>
			<View style={styles.actions}>
				<Pressable style={styles.btn} onPress={onOpenDSM}><Text style={styles.btnText}>Open DSM</Text></Pressable>
				<Pressable style={styles.btnGhost} onPress={onOpenNetwork}><Text style={styles.btnGhostText}>All sensors</Text></Pressable>
				<Pressable style={styles.btnGhost} onPress={onOpenDashboard}><Text style={styles.btnGhostText}>Dashboard</Text></Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 12 },
	link: { fontFamily: fonts.medium, color: colors.primary, fontSize: 13 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 26, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -4 },
	tag: { fontFamily: fonts.regular, fontSize: 12, color: "#6c757d" },
	kpis: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
	kpi: { flex: 1, minWidth: 120, backgroundColor: "#fff", borderRadius: 12, padding: 14, ...cardShadow() },
	kpiLabel: { fontFamily: fonts.medium, fontSize: 11, color: "rgba(12,35,64,0.7)" },
	kpiValue: { fontFamily: fonts.bold, fontSize: 18, color: colors.navy, marginTop: 4 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.navy },
	actions: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
	btn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
	btnText: { color: "#fff", fontFamily: fonts.semibold },
	btnGhost: { borderWidth: 1, borderColor: "#dee2e6", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
	btnGhostText: { color: colors.navy, fontFamily: fonts.medium },
});
