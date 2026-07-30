import React, { useState } from "react";
import { View, StyleSheet, ScrollView, SafeAreaView, useWindowDimensions } from "react-native";
import { Sidebar } from "../components/layout/Sidebar";
import { TopBar } from "../components/layout/TopBar";
import { AppPage, sidebarActive } from "../theme/ui";
import { DashboardPage } from "../pages/DashboardPage";
import { SensorNetworkPage } from "../pages/SensorNetworkPage";
import { AnalyticsPage } from "../pages/AnalyticsPage";
import { DSMPage } from "../pages/DSMPage";
import { ReportsPage } from "../pages/ReportsPage";
import { SystemSettingsPage } from "../pages/SystemSettingsPage";
import { AccountPage } from "../pages/AccountPage";
import { EditProfilePage } from "../pages/EditProfilePage";
import { ManageDevicesPage } from "../pages/ManageDevicesPage";
import { ActivityFeedPage } from "../pages/ActivityFeedPage";
import { SensorDetailPage } from "../pages/SensorDetailPage";
import { CreateReportPage } from "../pages/CreateReportPage";
import { UserMenuOverlay } from "../overlays/UserMenuOverlay";
import { SignOutConfirm } from "../overlays/SignOutConfirm";
import { NotificationsOverlay } from "../overlays/NotificationsOverlay";
import { SearchOverlay } from "../overlays/SearchOverlay";
import { ChangePasswordOverlay } from "../overlays/ChangePasswordOverlay";

interface Props {
	onSignOut?: () => void;
}

export function AppShell({ onSignOut }: Props) {
	const { width } = useWindowDimensions();
	const compact = width < 900;
	const [page, setPage] = useState<AppPage>("Dashboard");
	const [sensorId, setSensorId] = useState("HRV1_3_AIRF_102");
	const [userMenu, setUserMenu] = useState(false);
	const [signOut, setSignOut] = useState(false);
	const [notifications, setNotifications] = useState(false);
	const [search, setSearch] = useState(false);
	const [changePassword, setChangePassword] = useState(false);

	const go = (p: AppPage) => setPage(p);
	const openSensor = (tag?: string) => {
		if (tag) setSensorId(tag);
		setPage("SensorDetail");
	};

	const content = (() => {
		switch (page) {
			case "Dashboard":
				return <DashboardPage onOpenActivity={() => go("ActivityFeed")} onOpenSensor={() => openSensor("HRV1_3_AIRF_102")} />;
			case "SensorNetwork":
				return <SensorNetworkPage onOpenSensor={(tag) => openSensor(tag)} />;
			case "Analytics":
				return <AnalyticsPage />;
			case "DSM":
				return <DSMPage />;
			case "Reports":
				return <ReportsPage onCreate={() => go("CreateReport")} />;
			case "SystemSettings":
				return <SystemSettingsPage onOpenAccount={() => go("Account")} onSave={() => go("Dashboard")} />;
			case "Account":
				return (
					<AccountPage
						onEdit={() => go("EditProfile")}
						onDevices={() => go("ManageDevices")}
						onChangePassword={() => setChangePassword(true)}
						onSignOutAll={() => setSignOut(true)}
					/>
				);
			case "EditProfile":
				return <EditProfilePage onBack={() => go("Account")} onSave={() => go("Account")} />;
			case "ManageDevices":
				return <ManageDevicesPage onBack={() => go("Account")} />;
			case "ActivityFeed":
				return <ActivityFeedPage onBack={() => go("Dashboard")} />;
			case "SensorDetail":
				return (
					<SensorDetailPage
						sensorId={sensorId}
						onBack={() => go("SensorNetwork")}
						onOpenDSM={() => go("DSM")}
						onOpenNetwork={() => go("SensorNetwork")}
						onOpenDashboard={() => go("Dashboard")}
					/>
				);
			case "CreateReport":
				return <CreateReportPage onBack={() => go("Reports")} onGenerate={() => go("Reports")} />;
			default:
				return <DashboardPage />;
		}
	})();

	return (
		<SafeAreaView style={styles.safe}>
			<View style={styles.container}>
				{!compact && <Sidebar currentScreen={sidebarActive(page)} onNavigate={(s) => go(s as AppPage)} />}
				<View style={styles.main}>
					<TopBar onUserPress={() => setUserMenu(true)} onSearchPress={() => setSearch(true)} onNotificationsPress={() => setNotifications(true)} />
					<ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
						{content}
					</ScrollView>
				</View>
			</View>

			<UserMenuOverlay
				visible={userMenu}
				onClose={() => setUserMenu(false)}
				onViewProfile={() => {
					setUserMenu(false);
					go("Account");
				}}
				onSettings={() => {
					setUserMenu(false);
					go("SystemSettings");
				}}
				onNotifications={() => {
					setUserMenu(false);
					setNotifications(true);
				}}
				onSignOut={() => {
					setUserMenu(false);
					setSignOut(true);
				}}
			/>
			<SignOutConfirm
				visible={signOut}
				onCancel={() => setSignOut(false)}
				onConfirm={() => {
					setSignOut(false);
					onSignOut?.();
				}}
			/>
			<NotificationsOverlay
				visible={notifications}
				onClose={() => setNotifications(false)}
				onViewActivity={() => {
					setNotifications(false);
					go("ActivityFeed");
				}}
				onOpenSensor={() => {
					setNotifications(false);
					openSensor("HRV1_3_AIRF_102");
				}}
			/>
			<SearchOverlay
				visible={search}
				onClose={() => setSearch(false)}
				onOpenSensor={() => {
					setSearch(false);
					openSensor("HRV1_3_AIRF_102");
				}}
			/>
			<ChangePasswordOverlay visible={changePassword} onCancel={() => setChangePassword(false)} />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: { flex: 1, backgroundColor: "#f6f7f9" },
	container: { flex: 1, flexDirection: "row" },
	main: { flex: 1, backgroundColor: "#f6f7f9", minWidth: 0 },
	content: { flex: 1 },
	contentInner: { paddingHorizontal: 24, paddingVertical: 20, gap: 16, paddingBottom: 40 },
});
