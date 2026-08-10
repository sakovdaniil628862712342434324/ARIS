import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

const INITIAL = [
	{ id: "1", name: "MacBook Pro · Chrome", meta: "Calgary, AB · Current session", when: "Active now" },
	{ id: "2", name: "iPhone 15 · ARIS App", meta: "Calgary, AB · Mobile", when: "2h ago" },
	{ id: "3", name: "Control Room PC · Edge", meta: "Building Ops · Shared", when: "Yesterday" },
];

interface Props {
	onBack?: () => void;
}

export function ManageDevicesPage({ onBack }: Props) {
	const [devices, setDevices] = useState(INITIAL);
	return (
		<View style={styles.wrap}>
			<Pressable onPress={onBack}>
				<Text style={styles.back}>← Back</Text>
			</Pressable>
			<Text style={styles.title}>Manage Devices</Text>
			<Text style={styles.sub}>Trusted sessions and operator devices</Text>
			<View style={styles.card}>
				{devices.map((d) => (
					<View key={d.id} style={styles.row}>
						<View style={styles.icon} />
						<View style={{ flex: 1 }}>
							<Text style={styles.name}>{d.name}</Text>
							<Text style={styles.meta}>{d.meta}</Text>
						</View>
						<Text style={styles.when}>{d.when}</Text>
						<Pressable style={styles.revoke} onPress={() => setDevices((list) => list.filter((x) => x.id !== d.id))}>
							<Text style={styles.revokeText}>Revoke</Text>
						</Pressable>
					</View>
				))}
			</View>
			<Pressable style={styles.signOutAll} onPress={() => setDevices((list) => list.filter((d) => d.when === "Active now"))}>
				<Text style={styles.signOutAllText}>Sign out all other devices</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { gap: 12 },
	back: { fontFamily: fonts.medium, fontSize: 13, color: colors.primary },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: colors.navy },
	sub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginBottom: 4 },
	card: { backgroundColor: "#fff", borderRadius: 16, padding: 12, ...cardShadow() },
	row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.06)" },
	icon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.bg },
	name: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 14, color: colors.navy },
	meta: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
	when: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginRight: 8 },
	revoke: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
	revokeText: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
	signOutAll: { alignSelf: "flex-start", borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
	signOutAllText: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.navy },
});
