import React from "react";
import { View, StyleSheet } from "react-native";
import { Logo } from "../ui/Logo";
import { NavItem } from "../ui/NavItem";
import { DateCard } from "../ui/DateCard";
import { AppPage } from "../../theme/ui";

interface SidebarProps {
	currentScreen?: AppPage;
	onNavigate?: (screen: AppPage) => void;
}

const NAV: Array<{ label: string; screen: AppPage; icon: string }> = [
	{ label: "Dashboard Overview", screen: "Dashboard", icon: "Dashboard" },
	{ label: "Sensor Network", screen: "SensorNetwork", icon: "SensorNetwork" },
	{ label: "Analytics & Predictions", screen: "Analytics", icon: "Analytics" },
	{ label: "DSM Recommendations", screen: "DSM", icon: "DSM" },
	{ label: "Reports", screen: "Reports", icon: "Reports" },
	{ label: "System Settings", screen: "SystemSettings", icon: "SystemSettings" },
	{ label: "SQLite Admin", screen: "DatabaseViewer", icon: "DatabaseViewer" },
];

export function Sidebar({ currentScreen = "Dashboard", onNavigate }: SidebarProps) {
	return (
		<View style={styles.container}>
			<View style={styles.brand}>
				<Logo size="sm" />
			</View>
			<View style={styles.nav}>
				{NAV.map((item) => (
					<NavItem key={item.screen} label={item.label} icon={item.icon} active={currentScreen === item.screen} onPress={() => onNavigate?.(item.screen)} />
				))}
			</View>
			<DateCard />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { width: 236, backgroundColor: "#ffffff", borderRightWidth: 1, borderRightColor: "rgba(12, 35, 64, 0.12)", height: "100%" },
	brand: { height: 60, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "rgba(12, 35, 64, 0.15)", justifyContent: "center" },
	nav: { flex: 1, padding: 12, gap: 4 },
});
