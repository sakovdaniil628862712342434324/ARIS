import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";

const ITEMS = [
	{ title: "HRV1 Damper Pull Warning", time: "1m ago", body: "Airflow below threshold in Zone 3", unread: true },
	{ title: "New DSM Recommendation", time: "12m ago", body: "Night purge +45m · −6.0 kWh/day", unread: true },
	{ title: "Zone 2 Pressure Offline", time: "1h ago", body: "Sensor last seen 47m ago", unread: true },
	{ title: "Model Retrained", time: "6h ago", body: "Linear Regression · ±8% band", unread: false },
];

interface Props {
	visible: boolean;
	onClose: () => void;
	onViewActivity: () => void;
	onOpenSensor?: () => void;
}

export function NotificationsOverlay({ visible, onClose, onViewActivity, onOpenSensor }: Props) {
	const [items, setItems] = useState(ITEMS);
	const unread = items.filter((i) => i.unread).length;
	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<Pressable style={styles.backdrop} onPress={onClose}>
				<Pressable style={styles.panel} onPress={(e) => e.stopPropagation?.()}>
					<View style={styles.head}>
						<Text style={styles.title}>Notifications</Text>
						{unread === 0 ? (
							<Text style={styles.caught}>All caught up</Text>
						) : (
							<Pressable onPress={() => setItems((list) => list.map((x) => ({ ...x, unread: false })))}>
								<Text style={styles.count}>Mark all read</Text>
							</Pressable>
						)}
					</View>
					{unread === 0 ? (
						<View style={styles.empty}>
							<View style={styles.check} />
							<Text style={styles.emptyTitle}>All notifications read</Text>
							<Text style={styles.emptySub}>Check back for updates later.</Text>
						</View>
					) : (
						<ScrollView style={{ maxHeight: 360 }}>
							{items.map((n) => (
								<Pressable
									key={n.title}
									style={styles.row}
									onPress={() => {
										setItems((list) => list.map((x) => (x.title === n.title ? { ...x, unread: false } : x)));
										if (n.title.includes("HRV1")) {
											onClose();
											onOpenSensor?.();
										}
									}}
								>
									{n.unread ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
									<View style={{ flex: 1 }}>
										<Text style={styles.rowTitle}>{n.title}</Text>
										<Text style={styles.rowBody}>{n.body}</Text>
										<Text style={styles.rowTime}>{n.time}</Text>
									</View>
								</Pressable>
							))}
						</ScrollView>
					)}
					<Pressable onPress={onViewActivity} style={styles.linkBtn}>
						<Text style={styles.link}>View all activity</Text>
					</Pressable>
					<Pressable onPress={onClose} style={styles.linkBtn}>
						<Text style={styles.link}>Dismiss</Text>
					</Pressable>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: { flex: 1, backgroundColor: "rgba(12,35,64,0.18)", alignItems: "flex-end", paddingTop: 56, paddingRight: 72 },
	panel: { width: 360, maxWidth: "92%", backgroundColor: colors.white, borderRadius: 14, padding: 16, gap: 8, ...cardShadow("0px 12px 32px rgba(0,0,0,0.16)") },
	head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 16, color: colors.navy },
	caught: { fontFamily: fonts.medium, fontSize: 12, color: colors.success },
	count: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
	empty: { alignItems: "center", paddingVertical: 28, gap: 8 },
	check: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(40,167,69,0.15)", marginBottom: 4 },
	emptyTitle: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 15, color: colors.navy },
	emptySub: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
	row: { flexDirection: "row", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(12,35,64,0.08)" },
	dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 },
	dotSpacer: { width: 8 },
	rowTitle: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.text },
	rowBody: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
	rowTime: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 4 },
	linkBtn: { alignItems: "center", paddingVertical: 8, ...(Platform.OS === "web" ? { cursor: "pointer" as any } : null) },
	link: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 13, color: colors.primary },
});
