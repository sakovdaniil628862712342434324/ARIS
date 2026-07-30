import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

const FEED = [
	{ title: "HRV1 Damper Pull Warning", body: "Airflow below threshold in Zone 3", time: "15m ago", tone: "danger" },
	{ title: "New DSM Recommendation", body: "Night purge +45m proposed", time: "42m ago", tone: "info" },
	{ title: "Server back online", body: "CopperCube historian sync restored", time: "2h ago", tone: "ok" },
	{ title: "Manual Override Approved", body: "Slab Zn2 setpoint → 21.5°C", time: "3h ago", tone: "info" },
	{ title: "Operator signed in", body: "operator@sait.ca · Chrome · Calgary", time: "5h ago", tone: "ok" },
];

interface Props {
	onBack?: () => void;
}

export function ActivityFeedPage({ onBack }: Props) {
	return (
		<View style={styles.wrap}>
			<Pressable onPress={onBack}>
				<Text style={styles.back}>← Back</Text>
			</Pressable>
			<Text style={styles.title}>Activity Feed</Text>
			<Text style={styles.sub}>Chronological system alerts, approvals, and authentication events</Text>
			<View style={styles.card}>
				{FEED.map((f) => (
					<View key={f.title + f.time} style={styles.row}>
						<View style={[styles.dot, f.tone === "danger" ? styles.dDanger : f.tone === "ok" ? styles.dOk : styles.dInfo]} />
						<View style={{ flex: 1 }}>
							<Text style={styles.rowTitle}>{f.title}</Text>
							<Text style={styles.rowBody}>{f.body}</Text>
						</View>
						<Text style={styles.time}>{f.time}</Text>
					</View>
				))}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 12 },
	back: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginBottom: 4 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 8, ...cardShadow() },
	row: { flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 14, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.06)" },
	dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
	dDanger: { backgroundColor: colors.danger },
	dInfo: { backgroundColor: colors.primary },
	dOk: { backgroundColor: colors.success },
	rowTitle: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 14, color: colors.navy },
	rowBody: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
	time: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
});
