import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

interface Props {
	onBack?: () => void;
	onSave?: () => void;
}

export function EditProfilePage({ onBack, onSave }: Props) {
	const [name, setName] = useState("Facilities Operator");
	const [email, setEmail] = useState("ops@aris.building");
	const [role, setRole] = useState("Operator");
	const [site, setSite] = useState("HQ — Main Campus");
	return (
		<View style={styles.wrap}>
			<Pressable onPress={onBack}>
				<Text style={styles.back}>← Back</Text>
			</Pressable>
			<Text style={styles.title}>Edit Profile</Text>
			<Text style={styles.sub}>Update your operator profile details</Text>
			<View style={styles.card}>
				{[
					["Display name", name, setName],
					["Email", email, setEmail],
					["Role", role, setRole],
					["Site", site, setSite],
				].map(([label, value, set]: any) => (
					<View key={label} style={styles.field}>
						<Text style={styles.label}>{label}</Text>
						<TextInput style={styles.input} value={value} onChangeText={set} />
					</View>
				))}
				<View style={styles.actions}>
					<Pressable style={styles.save} onPress={onSave || onBack}>
						<Text style={styles.saveText}>Save profile</Text>
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
	input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, height: 42, paddingHorizontal: 12, fontFamily: fonts.regular, fontSize: 13, color: colors.text, ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : null) },
	actions: { flexDirection: "row", gap: 12, marginTop: 8 },
	save: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
	saveText: { color: "#fff", fontFamily: fonts.semibold, fontWeight: "600", fontSize: 14 },
	cancel: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12 },
	cancelText: { color: colors.navy, fontFamily: fonts.medium, fontWeight: "500", fontSize: 14 },
});
