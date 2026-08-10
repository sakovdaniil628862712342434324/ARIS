import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "../components/ui/Logo";

interface SignInScreenProps {
	onSignIn?: () => void;
	onForgotPassword?: () => void;
	onRequestAccess?: () => void;
}

export function SignInScreen({ onSignIn, onForgotPassword, onRequestAccess }: SignInScreenProps) {
	const [email, setEmail] = useState("operator@sait.ca");
	const [password, setPassword] = useState("password");
	const [rememberMe, setRememberMe] = useState(false);

	return (
		<LinearGradient colors={["#f6f7f9", "#e8f2fa", "#e0edf7"]} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.9 }} style={styles.gradient}>
			<SafeAreaView style={styles.safe}>
				<View style={styles.container}>
					<View style={styles.card}>
						<Logo size="lg" />
						<Text style={styles.title}>Sign in</Text>
						<Text style={styles.subtitle}>SAIT facilities · ARIS adaptive HVAC</Text>
						<View style={styles.spacer} />
						<View style={styles.field}>
							<Text style={styles.label}>Email</Text>
							<View style={styles.input}>
								<TextInput style={styles.inputText} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
							</View>
						</View>
						<View style={styles.field}>
							<Text style={styles.label}>Password</Text>
							<View style={styles.input}>
								<TextInput style={styles.inputText} value={password} onChangeText={setPassword} secureTextEntry />
							</View>
						</View>
						<View style={styles.row}>
							<Pressable style={styles.checkboxRow} onPress={() => setRememberMe((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: rememberMe }}>
								<View style={[styles.checkbox, rememberMe && styles.checkboxOn]}>{rememberMe ? <View style={styles.checkboxDot} /> : null}</View>
								<Text style={styles.checkboxLabel}>Remember me</Text>
							</Pressable>
							<Pressable onPress={onForgotPassword} accessibilityRole="link" style={styles.linkHit}>
								<Text style={styles.link}>Forgot password?</Text>
							</Pressable>
						</View>
						<Pressable style={({ pressed }) => [styles.signinButton, pressed && styles.pressed]} onPress={onSignIn} accessibilityRole="button">
							<Text style={styles.signinButtonText}>Sign in</Text>
						</Pressable>
						<View style={styles.accessRow}>
							<Text style={styles.accessText}>Need access?</Text>
							<Pressable onPress={onRequestAccess} accessibilityRole="link" style={styles.linkHit}>
								<Text style={styles.link}>Request account</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}

const cardShadow = Platform.select({
	web: { boxShadow: "0px 12px 32px rgba(0,0,0,0.14)" },
	default: { shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.14, shadowRadius: 32, elevation: 8 },
});

const styles = StyleSheet.create({
	gradient: { flex: 1, minHeight: "100%" as any },
	safe: { flex: 1 },
	container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
	card: { backgroundColor: "#ffffff", borderRadius: 16, paddingHorizontal: 40, paddingTop: 36, paddingBottom: 32, width: 440, maxWidth: "100%", gap: 18, ...cardShadow },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: "#0c2340" },
	subtitle: { fontFamily: fonts.regular, fontSize: 13, color: "#6c757d" },
	spacer: { height: 4 },
	field: { gap: 6, width: "100%" },
	label: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 12, color: "#0c2340" },
	input: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dee2e6", borderRadius: 10, height: 42, paddingHorizontal: 12, justifyContent: "center" },
	inputText: { fontSize: 13, fontFamily: fonts.regular, color: "#212529", ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}) },
	row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", minHeight: 20 },
	checkboxRow: { flexDirection: "row", alignItems: "center", gap: 6, cursor: "pointer" as any },
	checkbox: { width: 14, height: 14, borderRadius: 3, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dee2e6", alignItems: "center", justifyContent: "center" },
	checkboxOn: { borderColor: "#005eb8", backgroundColor: "#005eb8" },
	checkboxDot: { width: 6, height: 6, borderRadius: 1, backgroundColor: "#fff" },
	checkboxLabel: { fontFamily: fonts.regular, fontSize: 12, color: "#6c757d" },
	linkHit: { padding: 4, cursor: "pointer" as any },
	link: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 12, color: "#005eb8" },
	signinButton: { backgroundColor: "#005eb8", borderRadius: 10, height: 44, width: "100%", justifyContent: "center", alignItems: "center", cursor: "pointer" as any },
	pressed: { opacity: 0.9 },
	signinButtonText: { fontFamily: fonts.semibold, fontWeight: "600", fontSize: 14, color: "#ffffff" },
	accessRow: { flexDirection: "row", alignItems: "center", gap: 4 },
	accessText: { fontFamily: fonts.regular, fontSize: 12, color: "#6c757d" },
});
