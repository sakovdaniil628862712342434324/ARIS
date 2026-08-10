import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";
import { AreaChart } from "../components/ui/Charts";

type Rec = { id: string; zone: string; action: string; reason: string; impact: string; priority: string; status: string };

export function DSMPage() {
	const [recs, setRecs] = useState([] as Rec[]);
	const [kpis, setKpis] = useState([] as any[]);
	const [tou, setTou] = useState(null as any);
	const [err, setErr] = useState("");
	const load = () => api.dsm().then((d) => { setRecs(d.recommendations || []); setKpis(d.kpis || []); setTou(d.tou || null); }).catch((e) => setErr(String(e.message || e)));
	useEffect(() => { load(); }, []);
	const setStatus = async (id: string, status: string) => {
		try {
			await api.dsmAct(id, status === "Approved" ? "approve" : "dismiss");
			setRecs((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
			Alert.alert(status, "Saved to SQLite. Historian mode — no BACnet write-back.");
			load();
		} catch (e: any) {
			Alert.alert("Error", String(e.message || e));
		}
	};
	if (err) return <View style={styles.wrap}><Text style={styles.title}>DSM</Text><Text style={styles.sub}>{err}</Text></View>;
	if (!kpis.length && !recs.length && !err) return <View style={[styles.wrap, { padding: 40 }]}><ActivityIndicator color={colors.primary} /></View>;
	return (
		<View style={styles.wrap}>
			<Text style={styles.title}>DSM Recommendations</Text>
			<Text style={styles.sub}>Heuristic + ML-informed proposals from GBTAC energy patterns (approve logs only)</Text>
			<View style={styles.kpis}>
				{kpis.map(([l, v, u]: string[]) => (
					<View key={l} style={styles.kpi}>
						<Text style={styles.kpiLabel}>{l}</Text>
						<Text style={styles.kpiValue}>{v}{u ? <Text style={styles.kpiUnit}> {u}</Text> : null}</Text>
					</View>
				))}
			</View>
			{tou ? (
				<View style={styles.touCard}>
					<Text style={styles.queueTitle}>AESO-style TOU (snapshot)</Text>
					<Text style={styles.touSub}>{tou.source}</Text>
					<Text style={styles.touNow}>Now: {tou.now?.period} · {tou.now?.price}¢/kWh (hour {String(tou.now?.hour).padStart(2, "0")}:00)</Text>
					<AreaChart heights={tou.heights || []} tall />
					<Text style={styles.touHint}>{tou.suggestion}</Text>
				</View>
			) : null}
			<Text style={styles.queueTitle}>Recommendation Queue</Text>
			{recs.map((r) => (
				<View key={r.id} style={styles.card}>
					<View style={styles.cardTop}>
						<Text style={styles.zone}>{r.zone}</Text>
						<View style={styles.tags}>
							<View style={[styles.tag, r.priority === "High" ? styles.tagHigh : r.priority === "Medium" ? styles.tagMed : styles.tagLow]}>
								<Text style={styles.tagText}>{r.priority}</Text>
							</View>
							<View style={[styles.tag, r.status === "Pending" ? styles.tagPend : r.status === "Approved" ? styles.tagOk : styles.tagOff]}>
								<Text style={styles.tagText}>{r.status}</Text>
							</View>
						</View>
					</View>
					<Text style={styles.action}>{r.action}</Text>
					<Text style={styles.reason}>{r.reason}</Text>
					<View style={styles.cardBottom}>
						<Text style={styles.impact}>{r.impact}</Text>
						{r.status === "Pending" ? (
							<View style={styles.actions}>
								<Pressable style={styles.approve} onPress={() => setStatus(r.id, "Approved")}><Text style={styles.approveText}>Approve</Text></Pressable>
								<Pressable style={styles.decline} onPress={() => setStatus(r.id, "Dismissed")}><Text style={styles.declineText}>Decline</Text></Pressable>
							</View>
						) : null}
					</View>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 14 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -6 },
	kpis: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
	kpi: { flex: 1, minWidth: 160, backgroundColor: "#fff", borderRadius: 12, padding: 16, ...cardShadow() },
	kpiLabel: { fontFamily: fonts.medium, fontSize: 11, color: "rgba(12,35,64,0.7)" },
	kpiValue: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 26, color: colors.navy, marginTop: 4 },
	kpiUnit: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
	queueTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.navy, marginTop: 4 },
	touCard: { backgroundColor: "#fff", borderRadius: 14, padding: 16, gap: 6, ...cardShadow() },
	touSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
	touNow: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
	touHint: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4 },
	card: { backgroundColor: "#fff", borderRadius: 14, padding: 16, gap: 6, ...cardShadow() },
	cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	zone: { fontFamily: fonts.semibold, fontSize: 13, color: colors.primary },
	tags: { flexDirection: "row", gap: 6 },
	tag: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
	tagText: { fontFamily: fonts.medium, fontSize: 11, color: colors.navy },
	tagHigh: { backgroundColor: "rgba(220,53,69,0.12)" },
	tagMed: { backgroundColor: "rgba(211,158,0,0.15)" },
	tagLow: { backgroundColor: "rgba(108,117,125,0.12)" },
	tagPend: { backgroundColor: "rgba(0,163,224,0.15)" },
	tagOk: { backgroundColor: "rgba(40,167,69,0.15)" },
	tagOff: { backgroundColor: "rgba(108,117,125,0.12)" },
	action: { fontFamily: fonts.bold, fontSize: 15, color: colors.navy },
	reason: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
	cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6, flexWrap: "wrap", gap: 8 },
	impact: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
	actions: { flexDirection: "row", gap: 8 },
	approve: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
	approveText: { color: "#fff", fontFamily: fonts.semibold, fontSize: 13 },
	decline: { borderWidth: 1, borderColor: "#dee2e6", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
	declineText: { color: colors.navy, fontFamily: fonts.medium, fontSize: 13 },
});
