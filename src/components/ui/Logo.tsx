import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { fonts } from "../../theme/fonts";

interface LogoProps {
	size?: "sm" | "md" | "lg";
}

const SIZES = { sm: { icon: 28, text: 16 }, md: { icon: 32, text: 18 }, lg: { icon: 32, text: 18 } };

export function Logo({ size = "md" }: LogoProps) {
	const { icon, text } = SIZES[size];
	return (
		<View style={styles.container}>
			<Image source={require("../../../assets/logo-mark.png")} style={{ width: icon, height: icon, borderRadius: 8 }} />
			<Text style={[styles.text, { fontSize: text }]}>ARIS</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flexDirection: "row", alignItems: "center", gap: 10 },
	text: { fontFamily: fonts.bold, fontWeight: "700", color: "#0c2340", letterSpacing: 1.5 },
});
