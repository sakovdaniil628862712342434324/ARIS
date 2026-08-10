import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

const RECENT = ["Zone 2 pressure", "DSM recommendations", "Energy savings June", "Offline sensors"];
const RESULTS = [
	{ kind: "Sensor", title: "HRV1_3_AIRF_102", sub: "Airflow · Zone 3 · Warning" },
	{ kind: "Alert", title: "HRV1 Damper Pull Warning", sub: "Today at 3:37 PM" },
	{ kind: "DSM", title: "Extend night purge +45m", sub: "Potential −6.0 kWh/day" },
	{ kind: "Report", title: "Monthly Energy Savings — June", sub: "412 kWh · PDF" },
	{ kind: "Zone", title: "Zone 2 — Slab", sub: "Pressure sensor offline" },
	{ kind: "Setting", title: "Automation · Peak shaving", sub: "Currently off" },
];

interface Props {
	visible: boolean;
	onClose: () => void;
	onOpenSensor?: () => void;
}

export function SearchOverlay({ visible, onClose, onOpenSensor }: Props) {
	const [q, setQ] = useState("HRV1 damper");
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable style={styles.card} onPress={(e) => e.stopPropagation?.()}>
					<View style={styles.searchRow}>
						<TextInput style={styles.input} value={q} onChangeText={setQ} placeholder="Global Search…" placeholderTextColor="rgba(33,37,41,0.45)" autoFocus />
						<Pressable onPress={() => setQ("")} style={styles.clear}>
							<Text style={styles.clearText}>Clear</Text>
						</Pressable>
					</View>
					<Text style={styles.section}>Recent searches</Text>
					<View style={styles.chips}>
						{RECENT.map((r) => (
							<Pressable key={r} style={styles.chip} onPress={() => setQ(r)}>
								<Text style={styles.chipText}>{r}</Text>
							</Pressable>
						))}
					</View>
					<Text style={styles.section}>Results · {RESULTS.length} matches</Text>
					{RESULTS.map((r) => (
						<Pressable
							key={r.title}
							style={styles.result}
							onPress={() => {
								onClose();
								if (r.kind === "Sensor") onOpenSensor?.();
							}}
						>
							<View style={styles.kind}>
								<Text style={styles.kindText}>{r.kind}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={styles.resultTitle}>{r.title}</Text>
								<Text style={styles.resultSub}>{r.sub}</Text>
							</View>
						</Pressable>
					))}
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: { flex: 1, backgroundColor: "rgba(12,35,64,0.35)", alignItems: "center", paddingTop: 80, paddingHorizontal: 24 },
	card: { width: 720, maxWidth: "100%", backgroundColor: colors.white, borderRadius: 16, padding: 20, gap: 12, ...cardShadow("0px 16px 40px rgba(0,0,0,0.2)") },
	searchRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, height: 44 },
	input: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : null) },
	clear: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.bg, borderRadius: 8 },
	clearText: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
	section: { fontFamily: fonts.semibold, fontWeight: "600", fontSize: 13, color: colors.navy, marginTop: 4 },
	chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	chip: { backgroundColor: colors.bg, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
	chipText: { fontFamily: fonts.regular, fontSize: 12, color: colors.text },
	result: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.08)" },
	kind: { backgroundColor: "rgba(0,94,184,0.1)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
	kindText: { fontFamily: fonts.medium, fontSize: 11, color: colors.primary },
	resultTitle: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.text },
	resultSub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
});
