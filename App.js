import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, Platform } from "react-native";
import * as Font from "expo-font";
import { SignInScreen } from "./src/screens/SignInScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { RequestAccessScreen } from "./src/screens/RequestAccessScreen";
import { AppShell } from "./src/screens/AppShell";

function ensureWebRoot() {
	if (Platform.OS !== "web" || typeof document === "undefined") return;
	document.documentElement.style.height = "100%";
	document.body.style.height = "100%";
	document.body.style.margin = "0";
	const root = document.getElementById("root");
	if (root) {
		root.style.height = "100%";
		root.style.display = "flex";
	}
}

export default function App() {
	const [screen, setScreen] = useState("SignIn");

	useEffect(() => {
		ensureWebRoot();
		Font.loadAsync({
			"Inter-Regular": require("./assets/fonts/Inter-Regular.ttf"),
			"Inter-Medium": require("./assets/fonts/Inter-Medium.ttf"),
			"Inter-SemiBold": require("./assets/fonts/Inter-SemiBold.ttf"),
			"Inter-Bold": require("./assets/fonts/Inter-Bold.ttf"),
		}).catch((e) => console.warn("Font loading failed, using system fonts:", e));
	}, []);

	return (
		<View style={styles.container}>
			{Platform.OS !== "web" ? <StatusBar style="dark" /> : null}
			{screen === "SignIn" ? <SignInScreen onSignIn={() => setScreen("Dashboard")} onForgotPassword={() => setScreen("ForgotPassword")} onRequestAccess={() => setScreen("RequestAccess")} /> : null}
			{screen === "ForgotPassword" ? <ForgotPasswordScreen onBack={() => setScreen("SignIn")} onSent={() => setScreen("SignIn")} /> : null}
			{screen === "RequestAccess" ? <RequestAccessScreen onBack={() => setScreen("SignIn")} onSubmit={() => setScreen("SignIn")} /> : null}
			{screen === "Dashboard" ? <AppShell onSignOut={() => setScreen("SignIn")} /> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f6f7f9", height: "100%", width: "100%" },
});
