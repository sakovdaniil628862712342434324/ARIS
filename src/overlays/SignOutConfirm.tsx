import React from "react";
import { View, Text, StyleSheet, Pressable, Modal, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

interface Props {
	visible: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}

export function SignOutConfirm({ visible, onCancel, onConfirm }: Props) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
			<Pressable style={styles.backdrop} onPress={onCancel}>
				<Pressable style={styles.card} onPress={(e) => e.stopPropagation?.()}>
					<Text style={styles.title}>Sign out?</Text>
					<Text style={styles.body}>You’ll need to sign in again to access data.</Text>
					<View style={styles.row}>
						<Pressable style={styles.danger} onPress={onConfirm} accessibilityRole="button">
							<Text style={styles.dangerText}>Sign out</Text>
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
	card: { width: 420, maxWidth: "100%", backgroundColor: colors.white, borderRadius: 16, padding: 28, gap: 12, ...cardShadow("0px 16px 40px rgba(0,0,0,0.2)") },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 22, color: colors.navy },
	body: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: 8 },
	row: { flexDirection: "row", gap: 12, marginTop: 8 },
	danger: { backgroundColor: colors.danger, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12, ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
	dangerText: { fontFamily: fonts.semibold, fontWeight: "600", fontSize: 14, color: "#fff" },
	cancel: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: "#fff" },
	cancelText: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 14, color: colors.navy },
});
