import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Switch, ActivityIndicator, Alert } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";

interface Props { onOpenAccount?: () => void; onSave?: () => void }

export function SystemSettingsPage({ onOpenAccount, onSave }: Props) {
	const [auto, setAuto] = useState({ a: false, b: true, c: true, d: false });
	const [note, setNote] = useState({ a: true, b: true, c: false });
	const [integrations, setIntegrations] = useState([] as [string, string][]);
	const [footer, setFooter] = useState("");
	const [backupReady, setBackupReady] = useState(false);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const reload = () => {
		api.settings().then((d) => {
			setAuto(d.auto || auto);
			setNote(d.note || note);
			setIntegrations(d.integrations || []);
			setFooter(d.footer || "");
			setBackupReady(!!d.backupReady);
			setLoading(false);
		}).catch((e) => { Alert.alert("Settings", String(e.message || e)); setLoading(false); });
	};
	useEffect(() => { reload(); }, []);
	const save = async () => {
		try {
			await api.saveSettings({ auto, note });
			onSave?.();
			Alert.alert("Saved", "Settings written to SQLite.");
		} catch (e: any) {
			Alert.alert("Error", String(e.message || e));
		}
	};
	const resetDemo = () => {
		Alert.alert(
			"Reset demo database?",
			"Restores SQLite from aris.db.bak — all DSM recommendations return to Pending so you can demo Approve/Dismiss again.",
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: "Reset",
					style: "destructive",
					onPress: async () => {
						setBusy(true);
						try {
							const r = await api.resetDemoDb();
							Alert.alert("Restored", `Backup applied. DSM pending: ${r.dsm_pending}/${r.dsm_total}. Open SQLite Admin or DSM to verify.`);
							reload();
						} catch (e: any) {
							Alert.alert("Reset failed", String(e.message || e));
						}
						setBusy(false);
					},
				},
			],
		);
	};
	const saveBackup = () => {
		Alert.alert("Overwrite demo backup?", "Copies the current live DB onto aris.db.bak (use after staging a clean Pending DSM state).", [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Save backup",
				onPress: async () => {
					setBusy(true);
					try {
						const r = await api.saveBackup();
						Alert.alert("Backup saved", `${r.size_mb} MB → aris.db.bak`);
						reload();
					} catch (e: any) {
						Alert.alert("Backup failed", String(e.message || e));
					}
					setBusy(false);
				},
			},
		]);
	};
	if (loading) return <View style={[styles.wrap, { padding: 40 }]}><ActivityIndicator color={colors.primary} /></View>;
	const autoLabels = [
		["a", "Auto-approve low-risk DSM"],
		["b", "Night purge suggestions"],
		["c", "Peak shaving heuristics"],
		["d", "Control-room dark theme (UI only)"],
	] as const;
	const noteLabels = [
		["a", "Critical sensor offline"],
		["b", "New DSM recommendations"],
		["c", "Weekly summary digest"],
	] as const;
	return (
		<View style={styles.wrap}>
			<Text style={styles.title}>System Settings</Text>
			<Text style={styles.sub}>Historian mode — CSV/SQLite sync · no live BACnet write-back</Text>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Automation</Text>
				{autoLabels.map(([k, label]) => (
					<View key={k} style={styles.row}>
						<Text style={styles.label}>{label}</Text>
						<Switch value={(auto as any)[k]} onValueChange={(v) => setAuto({ ...auto, [k]: v })} />
					</View>
				))}
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Notifications</Text>
				{noteLabels.map(([k, label]) => (
					<View key={k} style={styles.row}>
						<Text style={styles.label}>{label}</Text>
						<Switch value={(note as any)[k]} onValueChange={(v) => setNote({ ...note, [k]: v })} />
					</View>
				))}
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Integrations</Text>
				{integrations.map(([n, s]) => (
					<View key={n} style={styles.row}>
						<Text style={styles.label}>{n}</Text>
						<Text style={{ fontFamily: fonts.medium, color: colors.primary }}>{s}</Text>
					</View>
				))}
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Demo database</Text>
				<Text style={styles.demoHelp}>
					Backup snapshot includes Pending DSM rows. After you Approve/Dismiss in a demo, hit Reset to restore and show SQLite updates again.
				</Text>
				<View style={styles.demoActions}>
					<Pressable style={[styles.reset, (!backupReady || busy) && styles.disabled]} disabled={!backupReady || busy} onPress={resetDemo}>
						<Text style={styles.resetText}>{busy ? "Working…" : "Reset to backup"}</Text>
					</Pressable>
					<Pressable style={[styles.ghost, busy && styles.disabled]} disabled={busy} onPress={saveBackup}>
						<Text style={styles.ghostText}>Save current as backup</Text>
					</Pressable>
				</View>
			</View>
			<View style={styles.actions}>
				<Pressable style={styles.save} onPress={save}><Text style={styles.saveText}>Save</Text></Pressable>
				<Pressable style={styles.ghost} onPress={onOpenAccount}><Text style={styles.ghostText}>Account</Text></Pressable>
			</View>
			<Text style={styles.footer}>{footer}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 14 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: -6 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 10, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.navy },
	row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 4 },
	label: { fontFamily: fonts.regular, fontSize: 14, color: colors.navy, flex: 1, paddingRight: 12 },
	demoHelp: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, lineHeight: 18 },
	demoActions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
	actions: { flexDirection: "row", gap: 10 },
	save: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
	saveText: { color: "#fff", fontFamily: fonts.semibold },
	reset: { backgroundColor: colors.danger, borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
	resetText: { color: "#fff", fontFamily: fonts.semibold },
	ghost: { borderWidth: 1, borderColor: "#dee2e6", borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
	ghostText: { color: colors.navy, fontFamily: fonts.medium },
	disabled: { opacity: 0.45 },
	footer: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
});
