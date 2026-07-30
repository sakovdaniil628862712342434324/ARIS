import { Platform, TextStyle } from "react-native";

const webStack = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const fonts = {
	regular: Platform.OS === "web" ? webStack : "Inter-Regular",
	medium: Platform.OS === "web" ? webStack : "Inter-Medium",
	semibold: Platform.OS === "web" ? webStack : "Inter-SemiBold",
	bold: Platform.OS === "web" ? webStack : "Inter-Bold",
} as const;

export function text(family: keyof typeof fonts, extra: TextStyle = {}): TextStyle {
	return { fontFamily: fonts[family], ...extra };
}
