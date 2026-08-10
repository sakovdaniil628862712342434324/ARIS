import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";

export function DatabaseViewerPage() {
	const [info, setInfo] = useState(null as any);
	const [table, setTable] = useState("dsm_recommendations");
	const [data, setData] = useState(null as any);
	const [err, setErr] = useState("");
	const [auto, setAuto] = useState(true);
	const [tick, setTick] = useState(0);

	const loadInfo = useCallback(() => {
		api.adminDb().then(setInfo).catch((e) => setErr(String(e.message || e)));
	}, []);
	const loadTable = useCallback(() => {
		api.adminTable(table, 40, 0).then(setData).catch((e) => setErr(String(e.message || e)));
	}, [table]);

	useEffect(() => { loadInfo(); }, [loadInfo, tick]);
	useEffect(() => { loadTable(); }, [loadTable, tick]);
	useEffect(() => {
		if (!auto) return;
		const id = setInterval(() => setTick((t) => t + 1), 2500);
		return () => clearInterval(id);
	}, [auto]);

	if (err && !info) return <View style={styles.wrap}><Text style={styles.title}>SQLite Admin</Text><Text style={styles.sub}>{err}</Text></View>;
	if (!info) return <View style={[styles.wrap, { padding: 40 }]}><ActivityIndicator color={colors.primary} /></View>;

	const cols = data?.columns || [];
	const rows = data?.rows || [];

	return (
		<View style={styles.wrap}>
			<View style={styles.head}>
				<View style={{ flex: 1 }}>
					<Text style={styles.title}>SQLite Admin Viewer</Text>
					<Text style={styles.sub}>{info.engine} · {info.path} · {info.size_mb} MB · live warehouse</Text>
					<Text style={styles.hint}>{info.note}</Text>
				</View>
				<View style={styles.headActions}>
					<Pressable style={[styles.chip, auto && styles.chipOn]} onPress={() => setAuto((v) => !v)}>
						<Text style={[styles.chipText, auto && styles.chipTextOn]}>{auto ? "Auto-refresh ON" : "Auto-refresh OFF"}</Text>
					</Pressable>
					<Pressable style={styles.refresh} onPress={() => setTick((t) => t + 1)}>
						<Text style={styles.refreshText}>Refresh now</Text>
					</Pressable>
				</View>
			</View>

			<View style={styles.tableChips}>
				{(info.tables || []).map((t: any) => (
					<Pressable key={t.name} style={[styles.tblChip, table === t.name && styles.tblChipOn]} onPress={() => setTable(t.name)}>
						<Text style={[styles.tblName, table === t.name && styles.tblNameOn]}>{t.name}</Text>
						<Text style={[styles.tblCount, table === t.name && styles.tblNameOn]}>{t.rows.toLocaleString()}</Text>
					</Pressable>
				))}
			</View>

			<View style={styles.card}>
				<View style={styles.cardHead}>
					<Text style={styles.cardTitle}>{table}</Text>
					<Text style={styles.meta}>{data ? `${rows.length} shown · ${data.total?.toLocaleString()} total` : "…"}</Text>
				</View>
				{table === "dsm_recommendations" ? (
					<Text style={styles.demoTip}>Demo tip: open DSM → Approve/Dismiss a recommendation → watch status + decided_at update here.</Text>
				) : null}
				<ScrollView horizontal showsHorizontalScrollIndicator>
					<View>
						<View style={styles.trHead}>
							{cols.map((c: string) => (
								<Text key={c} style={[styles.th, colWidth(c)]}>{c}</Text>
							))}
						</View>
						{!data ? <ActivityIndicator color={colors.primary} style={{ margin: 20 }} /> : null}
						{rows.map((r: any, i: number) => (
							<View key={i} style={[styles.tr, i % 2 ? styles.trAlt : null, highlightRow(table, r) && styles.trHot]}>
								{cols.map((c: string) => (
									<Text key={c} style={[styles.td, colWidth(c), statusColor(c, r[c])]} numberOfLines={2}>{String(r[c])}</Text>
								))}
							</View>
						))}
						{data && !rows.length ? <Text style={styles.empty}>No rows</Text> : null}
					</View>
				</ScrollView>
			</View>
		</View>
	);
}

function colWidth(c) {
	if (c === "id") return { width: 56 };
	if (c === "status" || c === "priority" || c === "kind") return { width: 100 };
	if (c.includes("at") || c === "ts" || c === "day" || c === "created_at" || c === "decided_at" || c === "trained_at") return { width: 150 };
	if (c === "action" || c === "reason" || c === "message" || c === "title" || c === "detail" || c === "path" || c === "metrics_json") return { width: 220 };
	if (c === "source_code" || c === "full_name" || c === "report_name") return { width: 160 };
	return { width: 110 };
}

function statusColor(col, val) {
	if (col !== "status") return null;
	if (val === "Approved") return { color: colors.success, fontFamily: fonts.semibold };
	if (val === "Dismissed") return { color: colors.muted };
	if (val === "Pending") return { color: colors.primary, fontFamily: fonts.semibold };
	return null;
}

function highlightRow(table, r) {
	if (table !== "dsm_recommendations") return false;
	return r.status === "Approved" || r.status === "Dismissed";
}

const styles = StyleSheet.create({
	wrap: { gap: 14 },
	head: { flexDirection: "row", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
	hint: { fontFamily: fonts.regular, fontSize: 12, color: colors.primary, marginTop: 4 },
	headActions: { flexDirection: "row", gap: 8, alignItems: "center" },
	chip: { borderWidth: 1, borderColor: "#dee2e6", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
	chipOn: { backgroundColor: "rgba(0,163,224,0.12)", borderColor: colors.cyan },
	chipText: { fontFamily: fonts.medium, fontSize: 12, color: colors.navy },
	chipTextOn: { color: colors.primary },
	refresh: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
	refreshText: { color: "#fff", fontFamily: fonts.semibold, fontSize: 13 },
	tableChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	tblChip: { backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#e9ecef", minWidth: 120, ...cardShadow("0px 1px 3px rgba(0,0,0,0.06)") },
	tblChipOn: { borderColor: colors.primary, backgroundColor: "rgba(0,94,184,0.06)" },
	tblName: { fontFamily: fonts.semibold, fontSize: 12, color: colors.navy },
	tblNameOn: { color: colors.primary },
	tblCount: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, gap: 8, ...cardShadow() },
	cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	cardTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.navy },
	meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
	demoTip: { fontFamily: fonts.regular, fontSize: 12, color: "#0c5460", backgroundColor: "rgba(0,163,224,0.1)", padding: 10, borderRadius: 8 },
	trHead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#dee2e6", paddingBottom: 8, marginBottom: 4 },
	th: { fontFamily: fonts.semibold, fontSize: 11, color: "#212529", paddingHorizontal: 6 },
	tr: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f1f3f5" },
	trAlt: { backgroundColor: "rgba(12,35,64,0.02)" },
	trHot: { backgroundColor: "rgba(40,167,69,0.08)" },
	td: { fontFamily: fonts.regular, fontSize: 11, color: "#212529", paddingHorizontal: 6, ...(Platform.OS === "web" ? { wordBreak: "break-word" } as any : {}) },
	empty: { fontFamily: fonts.regular, color: colors.muted, padding: 16 },
});
