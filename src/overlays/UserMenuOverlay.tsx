import React from "react";
import { View, Text, StyleSheet, Pressable, Modal, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

interface Props {
	visible: boolean;
	onClose: () => void;
	onViewProfile: () => void;
	onSettings: () => void;
	onNotifications: () => void;
	onSignOut: () => void;
	anchorRight?: number;
}

export function UserMenuOverlay({ visible, onClose, onViewProfile, onSettings, onNotifications, onSignOut }: Props) {
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable style={styles.menu} onPress={(e) => e.stopPropagation?.()}>
					<View style={styles.header}>
						<Text style={styles.name}>Operator</Text>
						<Text style={styles.email}>operator@sait.ca</Text>
					</View>
					<View style={styles.divider} />
					<Pressable style={styles.item} onPress={onViewProfile} accessibilityRole="button">
						<Text style={styles.itemText}>View profile</Text>
					</Pressable>
					<Pressable style={styles.item} onPress={onSettings} accessibilityRole="button">
						<Text style={styles.itemText}>Settings</Text>
					</Pressable>
					<Pressable style={styles.item} onPress={onNotifications} accessibilityRole="button">
						<Text style={styles.itemText}>Notifications</Text>
					</Pressable>
					<View style={styles.divider} />
					<Pressable style={styles.item} onPress={onSignOut} accessibilityRole="button">
						<Text style={styles.signOut}>Sign out</Text>
					</Pressable>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: { flex: 1, backgroundColor: "rgba(12,35,64,0.18)", alignItems: "flex-end", paddingTop: 56, paddingRight: 24 },
	menu: { width: 240, backgroundColor: colors.white, borderRadius: 12, paddingVertical: 8, ...cardShadow("0px 12px 32px rgba(0,0,0,0.16)"), ...(Platform.OS === "web" ? { cursor: "default" as any } : null) },
	header: { paddingHorizontal: 16, paddingVertical: 12, gap: 2 },
	name: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 14, color: colors.navy },
	email: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
	divider: { height: 1, backgroundColor: "rgba(12,35,64,0.1)", marginVertical: 4 },
	item: { paddingHorizontal: 16, paddingVertical: 12, ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
	itemText: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
	signOut: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 14, color: colors.danger },
});
