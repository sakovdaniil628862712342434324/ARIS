import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

const REPORTS = [
	{ name: "Monthly Energy Savings — June", period: "Jun 1–30", generated: "Jul 02", savings: "412 kWh", format: "PDF", status: "Ready" },
	{ name: "DSM Event Compliance", period: "Q2 2026", generated: "Jul 05", savings: "1.2 MWh", format: "CSV", status: "Ready" },
	{ name: "Sensor Health Snapshot", period: "Jul 08", generated: "—", savings: "—", format: "PDF", status: "Generating" },
	{ name: "Weekly DSM Digest", period: "Jul 7–13", generated: "—", savings: "—", format: "PDF", status: "Scheduled" },
];

interface Props {
	onCreate?: () => void;
}

export function ReportsPage({ onCreate }: Props) {
	return (
		<View style={styles.wrap}>
			<View style={styles.head}>
				<View>
					<Text style={styles.title}>Reports</Text>
					<Text style={styles.sub}>Generate, schedule and export building performance reports</Text>
				</View>
				<Pressable style={styles.newBtn} onPress={onCreate}>
					<Text style={styles.newText}>New Report</Text>
				</Pressable>
			</View>
			<View style={styles.row}>
				<View style={[styles.card, { flex: 2 }]}>
					<Text style={styles.cardTitle}>Report Library</Text>
					<View style={styles.thead}>
						{["REPORT", "PERIOD", "GENERATED", "SAVINGS", "FORMAT", "STATUS", ""].map((h, i) => (
							<Text key={i} style={[styles.th, i === 0 && { flex: 1.6 }]}>
								{h}
							</Text>
						))}
					</View>
					{REPORTS.map((r) => (
						<View key={r.name} style={styles.tr}>
							<Text style={[styles.td, { flex: 1.6 }]}>{r.name}</Text>
							<Text style={styles.td}>{r.period}</Text>
							<Text style={styles.td}>{r.generated}</Text>
							<Text style={styles.td}>{r.savings}</Text>
							<Text style={styles.td}>{r.format}</Text>
							<View style={[styles.badge, r.status === "Ready" ? styles.ready : r.status === "Generating" ? styles.gen : styles.sched]}>
								<Text style={styles.badgeText}>{r.status}</Text>
							</View>
							<Text style={[styles.td, { color: r.status === "Ready" ? colors.primary : colors.muted }]}>{r.status === "Ready" ? "Download" : "—"}</Text>
						</View>
					))}
				</View>
				<View style={{ flex: 1, gap: 16, minWidth: 220 }}>
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Savings Overview</Text>
						<View style={styles.bars}>
							{[40, 55, 70, 62, 85, 90, 48].map((h, i) => (
								<View key={i} style={[styles.bar, { height: h }]} />
							))}
						</View>
					</View>
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Scheduled Reports</Text>
						{[
							["Monthly Energy Summary", "1st of month · 06:00"],
							["Weekly DSM Digest", "Mondays · 08:00"],
							["Sensor Health Snapshot", "Daily · 23:00"],
						].map(([t, s]) => (
							<View key={t} style={styles.schedItem}>
								<Text style={styles.schedTitle}>{t}</Text>
								<Text style={styles.schedSub}>{s}</Text>
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
	head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
	newBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
	newText: { color: "#fff", fontFamily: fonts.semibold, fontWeight: "600", fontSize: 13 },
	row: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, gap: 10, flex: 1, minWidth: 280, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 16, color: colors.navy },
	thead: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 },
	th: { flex: 1, fontFamily: fonts.semibold, fontWeight: "600", fontSize: 10, color: colors.text },
	tr: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.06)" },
	td: { flex: 1, fontFamily: fonts.regular, fontSize: 12, color: colors.text },
	badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6 },
	ready: { backgroundColor: "rgba(0,94,184,0.12)" },
	gen: { backgroundColor: "rgba(0,163,224,0.15)" },
	sched: { backgroundColor: "rgba(12,35,64,0.12)" },
	badgeText: { fontFamily: fonts.medium, fontSize: 11, color: colors.navy },
	bars: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 6 },
	bar: { flex: 1, backgroundColor: colors.primary, borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.85 },
	schedItem: { backgroundColor: colors.bg, borderRadius: 10, padding: 12, gap: 2 },
	schedTitle: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.navy },
	schedSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
