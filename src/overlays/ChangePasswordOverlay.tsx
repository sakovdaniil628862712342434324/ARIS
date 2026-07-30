import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, TextInput, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

interface Props {
	visible: boolean;
	onCancel: () => void;
	onUpdate?: () => void;
}

export function ChangePasswordOverlay({ visible, onCancel, onUpdate }: Props) {
	const [cur, setCur] = useState("");
	const [next, setNext] = useState("");
	const [confirm, setConfirm] = useState("");
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<Pressable style={styles.backdrop} onPress={onCancel}>
				<Pressable style={styles.card} onPress={(e) => e.stopPropagation?.()}>
					<Text style={styles.title}>Change password</Text>
					<Text style={styles.sub}>Use a strong password you don’t reuse elsewhere.</Text>
					{[
						["Current password", cur, setCur],
						["New password", next, setNext],
						["Confirm new password", confirm, setConfirm],
					].map(([label, value, set]: any) => (
						<View key={label} style={styles.field}>
							<Text style={styles.label}>{label}</Text>
							<TextInput style={styles.input} value={value} onChangeText={set} secureTextEntry placeholder="······" placeholderTextColor="rgba(33,37,41,0.35)" />
						</View>
					))}
					<View style={styles.row}>
						<Pressable
							style={styles.primary}
							onPress={() => {
								onUpdate?.();
								onCancel();
							}}
							accessibilityRole="button"
						>
							<Text style={styles.primaryText}>Update password</Text>
						</Pressable>
						<Pressable style={styles.cancel} onPress={onCancel} accessibilityRole="button">
							<Text style={styles.cancelText}>Cancel</Text>
						</Pressable>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: { flex: 1, backgroundColor: "rgba(12,35,64,0.35)", alignItems: "center", justifyContent: "center", padding: 24 },
	card: { width: 440, maxWidth: "100%", backgroundColor: colors.white, borderRadius: 16, padding: 28, gap: 12, ...cardShadow("0px 16px 40px rgba(0,0,0,0.2)") },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 22, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginBottom: 4 },
	field: { gap: 6 },
	label: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 12, color: colors.navy },
	input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, height: 42, paddingHorizontal: 12, fontFamily: fonts.regular, fontSize: 14, color: colors.text, ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : null) },
	row: { flexDirection: "row", gap: 12, marginTop: 8, alignItems: "center" },
	primary: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12, ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
	primaryText: { fontFamily: fonts.semibold, fontWeight: "600", fontSize: 14, color: "#fff" },
	cancel: { paddingHorizontal: 8, paddingVertical: 12 },
	cancelText: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 14, color: colors.muted },
});
