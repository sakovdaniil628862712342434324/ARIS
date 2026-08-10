import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { fonts } from "../../theme/fonts";
import { Search, Bell, ChevronDown } from "lucide-react-native";

interface TopBarProps {
	onSearchPress?: () => void;
	onNotificationsPress?: () => void;
	onUserPress?: () => void;
}

export function TopBar({ onSearchPress, onNotificationsPress, onUserPress }: TopBarProps) {
	return (
		<View style={styles.container}>
			<Pressable style={styles.searchField} onPress={onSearchPress} accessibilityRole="search">
				<Search size={14} color="rgba(12, 35, 64, 0.5)" strokeWidth={2} />
				<Text style={styles.searchPlaceholder}>Global Search…</Text>
			</Pressable>
			<View style={styles.controls}>
				<Pressable style={styles.iconButton} onPress={onNotificationsPress} accessibilityRole="button">
					<Bell size={18} color="#6c757d" strokeWidth={2} />
					<View style={styles.notificationBadge} />
				</Pressable>
				<Pressable style={styles.userButton} onPress={onUserPress} accessibilityRole="button">
					<View style={styles.userAvatar}>
						<Text style={styles.avatarText}>AM</Text>
					</View>
					<Text style={styles.userLabel}>User</Text>
					<ChevronDown size={14} color="#6c757d" strokeWidth={2} />
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 60, paddingHorizontal: 24, backgroundColor: "#f6f7f9", borderBottomWidth: 1, borderBottomColor: "rgba(12, 35, 64, 0.15)" },
	searchField: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "rgba(12, 35, 64, 0.18)", borderRadius: 8, height: 36, width: 420, maxWidth: "55%", paddingHorizontal: 12 },
	searchPlaceholder: { flex: 1, fontSize: 13, fontFamily: fonts.regular, color: "rgba(33, 37, 41, 0.55)" },
	controls: { flexDirection: "row", alignItems: "center", gap: 10 },
	iconButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
	notificationBadge: { position: "absolute", top: 6, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: "#dc3545" },
	userButton: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f6f7f9", paddingLeft: 8, paddingRight: 10, paddingVertical: 6, borderRadius: 18 },
	userAvatar: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#005eb8", alignItems: "center", justifyContent: "center" },
	avatarText: { fontSize: 9, fontFamily: fonts.bold, fontWeight: "700", color: "#ffffff" },
	userLabel: { fontSize: 13, fontFamily: fonts.regular, color: "#212529" },
});
