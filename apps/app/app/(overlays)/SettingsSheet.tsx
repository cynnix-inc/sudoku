import { BlurView } from "expo-blur";
import React from "react";
import { View } from "react-native";
import { Text } from "@ultimate-sudoku/ui";

export default function SettingsSheet(): JSX.Element {
	return (
		<View className="absolute inset-0 justify-center p-6">
			<BlurView intensity={40} tint="dark" style={{ borderRadius: 16, overflow: "hidden" }}>
				<View className="p-6">
					<Text className="text-foreground">Settings Overlay</Text>
					<Text className="text-muted">Glass blur used only for overlays.</Text>
				</View>
			</BlurView>
		</View>
	);
}


