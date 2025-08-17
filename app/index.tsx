import React from "react";
import { View, Text } from "react-native";

export default function IndexScreen() {
	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
				Hello world
			</Text>
			<Text style={{ fontSize: 16, opacity: 0.7 }}>
				Welcome to Ultimate Sudoku
			</Text>
		</View>
	);
}
