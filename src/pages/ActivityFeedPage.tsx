import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";

interface Props { onBack?: () => void }

export function ActivityFeedPage({ onBack }: Props) {
	const [feed, setFeed] = useState([] as any[]);
	const [err, setErr] = useState("");
	useEffect(() => {
		api.activity().then((d) => setFeed(d.feed || [])).catch((e) => setErr(String(e.message || e)));
	}, []);
	return (
		<View style={styles.wrap}>
			<Pressable onPress={onBack}><Text style={styles.back}>← Back</Text></Pressable>
			<Text style={styles.title}>Activity Feed</Text>
			<Text style={styles.sub}>Alerts & ML anomalies from SQLite historian</Text>
			{err ? <Text style={styles.sub}>{err}</Text> : null}
			{!feed.length && !err ? <ActivityIndicator color={colors.primary} /> : null}
			<View style={styles.card}>
				{feed.map((f) => (
					<View key={f.title + f.time} style={styles.row}>
						<View style={[styles.dot, styles.dInfo]} />
						<View style={{ flex: 1 }}>
							<Text style={styles.rowTitle}>{f.title}</Text>
							<Text style={styles.rowBody}>{f.meta}</Text>
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
	back: { fontFamily: fonts.medium, color: colors.primary, fontSize: 13 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -4 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 12, ...cardShadow() },
	row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f3f5" },
	dot: { width: 10, height: 10, borderRadius: 5 },
	dInfo: { backgroundColor: colors.cyan },
	rowTitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
	rowBody: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
	time: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
});
