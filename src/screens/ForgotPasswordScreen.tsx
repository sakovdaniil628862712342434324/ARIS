import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, SafeAreaView, Platform } from "react-native";
import { fonts } from "../theme/fonts";
import { LinearGradient } from "expo-linear-gradient";
import { Logo } from "../components/ui/Logo";

interface Props {
	onBack?: () => void;
	onSent?: () => void;
}

export function ForgotPasswordScreen({ onBack, onSent }: Props) {
	const [email, setEmail] = useState("operator@sait.ca");
	return (
		<LinearGradient colors={["#f6f7f9", "#e8f2fa", "#e0edf7"]} start={{ x: 0, y: 0.2 }} end={{ x: 1, y: 0.9 }} style={styles.gradient}>
			<SafeAreaView style={styles.safe}>
				<View style={styles.container}>
					<View style={styles.card}>
						<Logo size="lg" />
						<Text style={styles.title}>Reset password</Text>
						<Text style={styles.subtitle}>Enter your SAIT email and we’ll send a reset link.</Text>
						<View style={styles.field}>
							<Text style={styles.label}>Email</Text>
							<View style={styles.input}>
								<TextInput style={styles.inputText} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
							</View>
						</View>
						<Pressable style={({ pressed }) => [styles.button, pressed && styles.pressed]} onPress={onSent} accessibilityRole="button">
							<Text style={styles.buttonText}>Send reset link</Text>
						</Pressable>
						<Pressable onPress={onBack} accessibilityRole="link" style={styles.linkHit}>
							<Text style={styles.back}>← Back to sign in</Text>
						</Pressable>
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
	card: { backgroundColor: "#ffffff", borderRadius: 16, padding: 40, width: 440, maxWidth: "100%", gap: 18, ...cardShadow },
	title: { fontFamily: fonts.bold, fontWeight: "700", fontSize: 28, color: "#0c2340" },
	subtitle: { fontFamily: fonts.regular, fontSize: 13, color: "#6c757d" },
	field: { gap: 6, width: "100%" },
	label: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 12, color: "#0c2340" },
	input: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#dee2e6", borderRadius: 10, height: 42, paddingHorizontal: 12, justifyContent: "center" },
	inputText: { fontSize: 13, fontFamily: fonts.regular, color: "#212529", ...(Platform.OS === "web" ? { outlineStyle: "none" as any } : {}) },
	button: { backgroundColor: "#005eb8", borderRadius: 10, height: 44, width: "100%", justifyContent: "center", alignItems: "center", cursor: "pointer" as any },
	pressed: { opacity: 0.9 },
	buttonText: { fontFamily: fonts.semibold, fontWeight: "600", fontSize: 14, color: "#ffffff" },
	linkHit: { paddingVertical: 4, cursor: "pointer" as any },
	back: { fontFamily: fonts.medium, fontWeight: "500", fontSize: 12, color: "#005eb8" },
});
