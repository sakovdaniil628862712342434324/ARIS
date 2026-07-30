import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { fonts } from "../../theme/fonts";
import { LayoutDashboard, Radio, LineChart, Zap, FileText, Settings } from "lucide-react-native";

interface NavItemProps {
	label: string;
	active?: boolean;
	onPress?: () => void;
	icon?: string;
}

const ICONS: Record<string, any> = {
	Dashboard: LayoutDashboard,
	SensorNetwork: Radio,
	Analytics: LineChart,
	DSM: Zap,
	Reports: FileText,
	SystemSettings: Settings,
};

export function NavItem({ label, active = false, onPress, icon }: NavItemProps) {
	const Icon = (icon && ICONS[icon]) || LayoutDashboard;
	return (
		<Pressable onPress={onPress} style={[styles.container, active && styles.active]}>
			{active ? <View style={styles.activeRail} /> : <View style={styles.railSpacer} />}
			<Icon size={18} color={active ? "#00a3e0" : "rgba(12, 35, 64, 0.7)"} strokeWidth={2} />
			<Text style={[styles.text, active && styles.textActive]} numberOfLines={2}>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: { flexDirection: "row", alignItems: "center", gap: 10, height: 40, paddingHorizontal: 12, borderRadius: 8, width: "100%" },
	active: { backgroundColor: "rgba(0, 163, 224, 0.12)" },
	activeRail: { width: 3, height: 20, backgroundColor: "#00a3e0", borderRadius: 2 },
	railSpacer: { width: 3, height: 20, opacity: 0 },
	text: { flex: 1, fontSize: 13.5, fontFamily: fonts.regular, color: "rgba(33, 37, 41, 0.7)" },
	textActive: { color: "#005eb8", fontFamily: fonts.medium, fontWeight: "500" },
});
