import { Platform, ViewStyle } from "react-native";

export const colors = {
	primary: "#005eb8",
	cyan: "#00a3e0",
	navy: "#0c2340",
	text: "#212529",
	muted: "#6c757d",
	border: "#dee2e6",
	bg: "#f6f7f9",
	white: "#ffffff",
	danger: "#dc3545",
	success: "#28a745",
	warn: "#ffc107",
};

export const cardShadow = (web = "0px 4px 8px rgba(0,0,0,0.1)"): ViewStyle =>
	Platform.OS === "web" ? ({ boxShadow: web } as ViewStyle) : { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 };

export type AppPage =
	| "Dashboard"
	| "SensorNetwork"
	| "Analytics"
	| "DSM"
	| "Reports"
	| "SystemSettings"
	| "DatabaseViewer"
	| "Account"
	| "EditProfile"
	| "ManageDevices"
	| "ActivityFeed"
	| "SensorDetail"
	| "CreateReport";

export function sidebarActive(page: AppPage): AppPage {
	if (page === "Account" || page === "EditProfile" || page === "ManageDevices") return "SystemSettings";
	if (page === "CreateReport") return "Reports";
	if (page === "SensorDetail") return "SensorNetwork";
	if (page === "ActivityFeed") return "Dashboard";
	return page;
}
