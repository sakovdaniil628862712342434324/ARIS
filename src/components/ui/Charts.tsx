import React from "react";
import { View, StyleSheet } from "react-native";

/** Simple bar sparkline from numeric heights (px). */
export function Sparkline({ pts, color = "#005eb8" }: { pts: number[]; color?: string }) {
	const data = pts?.length ? pts : [8, 12, 10, 14];
	return (
		<View style={styles.sparkline}>
			{data.map((h, i) => (
				<View key={i} style={[styles.sparkBar, { height: Math.max(4, h), backgroundColor: color }]} />
			))}
		</View>
	);
}

/** Vertical area-style bars; heights are 0–100 percentages. */
export function AreaChart({ heights, tall }: { heights: number[]; tall?: boolean }) {
	const data = heights?.length ? heights : [40, 55, 48, 70];
	return (
		<View style={[styles.chart, tall && { height: 160 }]}>
			{data.map((h, i) => (
				<View key={i} style={styles.chartCol}>
					<View style={[styles.chartFill, { height: `${Math.min(100, Math.max(5, h))}%` as any }]} />
				</View>
			))}
		</View>
	);
}

/** Dual series overlay (predicted vs actual) using two bar colors. */
export function DualAreaChart({ a, b, tall }: { a: number[]; b: number[]; tall?: boolean }) {
	const n = Math.max(a?.length || 0, b?.length || 0, 8);
	const A = [...(a || [])];
	const B = [...(b || [])];
	while (A.length < n) A.push(A[A.length - 1] || 40);
	while (B.length < n) B.push(B[B.length - 1] || 40);
	return (
		<View style={[styles.chart, tall && { height: 160 }]}>
			{Array.from({ length: n }).map((_, i) => (
				<View key={i} style={styles.dualCol}>
					<View style={[styles.dualBar, { height: `${Math.min(100, A[i])}%` as any, backgroundColor: "rgba(0,94,184,0.35)" }]} />
					<View style={[styles.dualBar, { height: `${Math.min(100, B[i])}%` as any, backgroundColor: "rgba(0,163,224,0.75)", position: "absolute", bottom: 0, left: 0, right: 0 }]} />
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	sparkline: { flexDirection: "row", alignItems: "flex-end", gap: 3, height: 32, marginTop: 8 },
	sparkBar: { width: 6, borderRadius: 2, backgroundColor: "#005eb8" },
	chart: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 4, marginTop: 12 },
	chartCol: { flex: 1, height: "100%", justifyContent: "flex-end" },
	chartFill: { width: "100%", backgroundColor: "rgba(0,94,184,0.55)", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
	dualCol: { flex: 1, height: "100%", justifyContent: "flex-end", position: "relative" },
	dualBar: { width: "100%", borderTopLeftRadius: 3, borderTopRightRadius: 3 },
});
