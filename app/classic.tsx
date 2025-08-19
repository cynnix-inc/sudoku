import React from "react";
import { View, Text } from "react-native";

export default function ClassicScreen() {
	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 8 }}>
				Classic
			</Text>
			<Text style={{ fontSize: 16, opacity: 0.7 }}>
				9×9 Classic Sudoku
			</Text>
		</View>
	);
}


