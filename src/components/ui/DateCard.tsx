import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { fonts } from "../../theme/fonts";

export function DateCard() {
	const date = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase();
	return (
		<View style={styles.container}>
			<View style={styles.card}>
				<Text style={styles.date}>{date}</Text>
				<Text style={styles.subtext}>System time · UTC-05</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { paddingHorizontal: 12, paddingBottom: 16 },
	card: { backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "rgba(12, 35, 64, 0.15)", paddingHorizontal: 14, paddingVertical: 12 },
	date: { fontFamily: fonts.semibold, fontWeight: "600", fontSize: 13, color: "#212529" },
	subtext: { fontFamily: fonts.regular, fontSize: 10, color: "rgba(33, 37, 41, 0.6)", marginTop: 4 },
});
