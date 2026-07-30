import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Switch, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

function Row({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
	return (
		<View style={styles.toggleRow}>
			<Text style={styles.toggleLabel}>{label}</Text>
			<Switch value={value} onValueChange={onChange} trackColor={{ true: colors.primary, false: "#c9ced6" }} thumbColor="#fff" />
		</View>
	);
}

interface Props {
	onOpenAccount?: () => void;
	onSave?: () => void;
}

export function SystemSettingsPage({ onOpenAccount, onSave }: Props) {
	const [auto, setAuto] = useState({ a: true, b: true, c: false, d: true });
	const [note, setNote] = useState({ a: true, b: true, c: false });
	return (
		<View style={styles.wrap}>
			<Text style={styles.title}>System Settings</Text>
			<Text style={styles.sub}>Configure ARIS operation, automation and integrations</Text>
			<View style={styles.card}>
				<View style={styles.cardHead}>
					<Text style={styles.cardTitle}>Account & security</Text>
					<Pressable onPress={onOpenAccount}>
						<Text style={styles.link}>Open account →</Text>
					</Pressable>
				</View>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Automation</Text>
				<Row label="Auto-approve low-risk DSM" value={auto.a} onChange={(v) => setAuto({ ...auto, a: v })} />
				<Row label="Night purge scheduling" value={auto.b} onChange={(v) => setAuto({ ...auto, b: v })} />
				<Row label="Peak shaving" value={auto.c} onChange={(v) => setAuto({ ...auto, c: v })} />
				<Row label="Control-room dark theme" value={auto.d} onChange={(v) => setAuto({ ...auto, d: v })} />
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Notifications</Text>
				<Row label="Critical sensor offline" value={note.a} onChange={(v) => setNote({ ...note, a: v })} />
				<Row label="New DSM recommendations" value={note.b} onChange={(v) => setNote({ ...note, b: v })} />
				<Row label="Weekly summary digest" value={note.c} onChange={(v) => setNote({ ...note, c: v })} />
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Integrations</Text>
				{[
					["BACnet Gateway", "Connected"],
					["Grid Demand API", "Connected"],
					["Weather Service", "Connected"],
					["Email / SMTP", "Manage"],
				].map(([n, s]) => (
					<View key={n} style={styles.intRow}>
						<Text style={styles.intName}>{n}</Text>
						<Text style={[styles.intStatus, s === "Manage" && { color: colors.primary }]}>{s}</Text>
					</View>
				))}
			</View>
			<View style={styles.footer}>
				<Text style={styles.footNote}>ARIS v2.4.1 · all systems nominal · last sync 42s ago</Text>
				<Pressable style={styles.save} onPress={onSave}>
					<Text style={styles.saveText}>Save Changes</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 14 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -6 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, gap: 10, ...cardShadow() },
	cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 16, color: colors.navy },
	link: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.primary, ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
	toggleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.06)" },
	toggleLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, flex: 1, paddingRight: 12 },
	intRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.06)" },
	intName: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
	intStatus: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.success },
	footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, flexWrap: "wrap", gap: 12 },
	footNote: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
	save: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
	saveText: { color: "#fff", fontFamily: fonts.semibold, fontWeight: "600", fontSize: 14 },
});
