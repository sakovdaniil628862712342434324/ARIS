import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, ActivityIndicator } from "react-native";
import { fonts } from "../theme/fonts";
import { colors, cardShadow } from "../theme/ui";
import { api } from "../services/api";

interface Props {
	visible: boolean;
	onClose: () => void;
	onViewActivity: () => void;
	onOpenSensor?: () => void;
}

export function NotificationsOverlay({ visible, onClose, onViewActivity, onOpenSensor }: Props) {
	const [items, setItems] = useState([] as any[]);
	const [loading, setLoading] = useState(false);
	useEffect(() => {
		if (!visible) return;
		setLoading(true);
		api.activity().then((d) => {
			setItems((d.feed || []).slice(0, 12).map((f: any, i: number) => ({
				title: f.title,
				time: f.time,
				body: f.meta,
				unread: i < 3,
			})));
			setLoading(false);
		}).catch(() => setLoading(false));
	}, [visible]);
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
					{loading ? <ActivityIndicator color={colors.primary} style={{ margin: 20 }} /> : null}
					{!loading && unread === 0 && !items.length ? (
						<View style={styles.empty}>
							<Text style={styles.emptyTitle}>No alerts in SQLite</Text>
							<Text style={styles.emptySub}>Alerts appear after ETL / ML anomaly pass.</Text>
						</View>
					) : null}
					{!loading && items.length ? (
						<ScrollView style={{ maxHeight: 360 }}>
							{items.map((n) => (
								<Pressable
									key={n.title + n.time}
									style={styles.row}
									onPress={() => {
										setItems((list) => list.map((x) => (x.title === n.title && x.time === n.time ? { ...x, unread: false } : x)));
										if (String(n.title).toLowerCase().includes("hvac") || String(n.body).includes("anomaly")) {
											onClose();
											onOpenSensor?.();
										}
									}}
								>
									{n.unread ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
									<View style={{ flex: 1 }}>
										<Text style={styles.rowTitle}>{n.title}</Text>
										<Text style={styles.rowBody}>{n.body}</Text>
										<Text style={styles.time}>{n.time}</Text>
									</View>
								</Pressable>
							))}
						</ScrollView>
					) : null}
					<Pressable style={styles.footer} onPress={onViewActivity}>
						<Text style={styles.footerText}>View activity feed</Text>
					</Pressable>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: { flex: 1, backgroundColor: "rgba(12,35,64,0.25)", justifyContent: "flex-start", alignItems: "flex-end", paddingTop: 56, paddingRight: 24 },
	panel: { width: 360, maxWidth: "92%", backgroundColor: "#fff", borderRadius: 14, padding: 14, ...cardShadow() },
	head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
	title: { fontFamily: fonts.bold, fontSize: 16, color: colors.navy },
	caught: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
	count: { fontFamily: fonts.medium, fontSize: 12, color: colors.primary },
	empty: { padding: 20, alignItems: "center", gap: 4 },
	emptyTitle: { fontFamily: fonts.semibold, color: colors.navy },
	emptySub: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
	row: { flexDirection: "row", gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f1f3f5" },
	dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.cyan, marginTop: 5 },
	dotSpacer: { width: 8 },
	rowTitle: { fontFamily: fonts.medium, fontSize: 13, color: colors.navy },
	rowBody: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted },
	time: { fontFamily: fonts.regular, fontSize: 10, color: colors.muted, marginTop: 2 },
	footer: { marginTop: 10, alignItems: "center" },
	footerText: { fontFamily: fonts.medium, color: colors.primary, fontSize: 13 },
});
