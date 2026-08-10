import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

interface Props {
	onEdit?: () => void;
	onDevices?: () => void;
	onChangePassword?: () => void;
	onSignOutAll?: () => void;
	onBack?: () => void;
}

export function AccountPage({ onEdit, onDevices, onChangePassword, onSignOutAll }: Props) {
	return (
		<View style={styles.wrap}>
			<View style={styles.hero}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>AM</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={styles.title}>Facilities Operator</Text>
					<Text style={styles.sub}>operator@sait.ca · HQ — Main Campus</Text>
				</View>
				<Pressable style={styles.edit} onPress={onEdit}>
					<Text style={styles.editText}>Edit profile</Text>
				</Pressable>
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Profile</Text>
				{[
					["Display name", "Facilities Operator"],
					["Email", "operator@sait.ca"],
					["Role", "Operator"],
					["Site", "HQ — Main Campus"],
					["Theme", "Light"],
					["Language", "English"],
					["Landing page", "Dashboard Overview"],
				].map(([k, v]) => (
					<View key={k} style={styles.row}>
						<Text style={styles.key}>{k}</Text>
						<Text style={styles.val}>{v}</Text>
					</View>
				))}
			</View>
			<View style={styles.card}>
				<Text style={styles.cardTitle}>Security</Text>
				<Text style={styles.note}>Password last changed 42 days ago</Text>
				<View style={styles.actions}>
					<Pressable style={styles.btn} onPress={onChangePassword}>
						<Text style={styles.btnText}>Change password</Text>
					</Pressable>
					<Pressable style={styles.btnOutline} onPress={onDevices}>
						<Text style={styles.btnOutlineText}>Manage devices</Text>
					</Pressable>
					<Pressable onPress={onSignOutAll}>
						<Text style={styles.danger}>Sign out on all devices</Text>
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 16 },
	hero: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: "#fff", borderRadius: 16, padding: 20, ...cardShadow() },
	avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
	avatarText: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 20, color: "#fff" },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 24, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 4 },
	edit: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
	editText: { color: "#fff", fontFamily: fonts.semibold, fontWeight: "600", fontSize: 13 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, gap: 8, ...cardShadow() },
	cardTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 16, color: colors.navy, marginBottom: 4 },
	row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.06)" },
	key: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
	val: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.text },
	note: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
	actions: { flexDirection: "row", flexWrap: "wrap", gap: 12, alignItems: "center", marginTop: 8 },
	btn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
	btnText: { color: "#fff", fontFamily: fonts.semibold, fontWeight: "600", fontSize: 13 },
	btnOutline: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
	btnOutlineText: { color: colors.navy, fontFamily: fonts.medium, fontWeight: "500", fontSize: 13 },
	danger: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.danger, ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
});
