import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

interface Props {
	onBack?: () => void;
	onGenerate?: () => void;
}

export function CreateReportPage({ onBack, onGenerate }: Props) {
	const [name, setName] = useState("Monthly Energy Summary");
	return (
		<View style={styles.wrap}>
			<Pressable onPress={onBack}>
				<Text style={styles.back}>← Back</Text>
			</Pressable>
			<Text style={styles.title}>Create Report</Text>
			<Text style={styles.sub}>Generate a new building performance report</Text>
			<View style={styles.card}>
				{[
					["Report name", name, setName],
					["Type", "Energy savings", null],
					["Date range", "Last 30 days", null],
					["Format", "PDF + CSV", null],
					["Schedule", "One-time", null],
				].map(([label, value, set]: any) => (
					<View key={label} style={styles.field}>
						<Text style={styles.label}>{label}</Text>
						{set ? <TextInput style={styles.input} value={value} onChangeText={set} /> : <View style={styles.input}><Text style={styles.inputText}>{value}</Text></View>}
					</View>
				))}
				<View style={styles.actions}>
					<Pressable style={styles.save} onPress={onGenerate || onBack}>
						<Text style={styles.saveText}>Generate report</Text>
					</Pressable>
					<Pressable style={styles.cancel} onPress={onBack}>
						<Text style={styles.cancelText}>Cancel</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 10, maxWidth: 720 },
	back: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginBottom: 6 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, gap: 14, ...cardShadow() },
	field: { gap: 6 },
	label: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 12, color: colors.navy },
	input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, height: 42, paddingHorizontal: 12, justifyContent: "center", ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : null) },
	inputText: { fontFamily: fonts.regular, fontSize: 13, color: colors.text },
	actions: { flexDirection: "row", gap: 12, marginTop: 8 },
	save: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
	saveText: { color: "#fff", fontFamily: fonts.semibold, fontWeight: "600", fontSize: 14 },
	cancel: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
	cancelText: { color: colors.navy, fontFamily: fonts.medium, fontWeight: "500", fontSize: 14 },
});
