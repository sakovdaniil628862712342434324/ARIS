import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";
import { AreaChart } from "../components/ui/Charts";

interface Props { onCreate?: () => void }

export function ReportsPage({ onCreate }: Props) {
	const [data, setData] = useState(null as any);
	const [err, setErr] = useState("");
	useEffect(() => { api.reports().then(setData).catch((e) => setErr(String(e.message || e))); }, []);
	if (err) return <View style={styles.wrap}><Text style={styles.title}>Reports</Text><Text style={styles.sub}>{err}</Text></View>;
	if (!data) return <View style={[styles.wrap, { padding: 40 }]}><ActivityIndicator color={colors.primary} /></View>;
	return (
		<View style={styles.wrap}>
			<View style={styles.head}>
				<View>
					<Text style={styles.title}>Reports</Text>
					<Text style={styles.sub}>Generated from SQLite energy_daily + emissions factor 0.54</Text>
				</View>
				<Pressable style={styles.newBtn} onPress={onCreate}><Text style={styles.newText}>New Report</Text></Pressable>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Savings / Load Overview</Text>
				<AreaChart heights={data.savingsHeights || []} />
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Report Library</Text>
				{(data.reports || []).map((r: any) => (
					<View key={r.name} style={styles.row}>
						<View style={{ flex: 1.4 }}><Text style={styles.name}>{r.name}</Text><Text style={styles.meta}>{r.period}</Text></View>
						<Text style={styles.cell}>{r.generated}</Text>
						<Text style={styles.cell}>{r.savings}</Text>
						<Text style={styles.cell}>{r.format}</Text>
						<Text style={[styles.cell, { color: colors.primary }]}>{r.status}</Text>
					</View>
				))}
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Scheduled</Text>
				{(data.scheduled || []).map(([t, s]: string[]) => (
					<View key={t} style={styles.sched}><Text style={styles.name}>{t}</Text><Text style={styles.meta}>{s}</Text></View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 14 },
	head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
	newBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
	newText: { color: "#fff", fontFamily: fonts.semibold },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 8, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.navy },
	row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f3f5", gap: 8 },
	name: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
	meta: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
	cell: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: "#212529" },
	sched: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f3f5" },
});
