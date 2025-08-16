import React from "react";
import { View } from "react-native";
import { Text } from "@ultimate-sudoku/ui";

export default function HomeScreen(): JSX.Element {
	return (
		<View className="flex-1 items-center justify-center bg-background ">
			<Text className="text-xl font-semibold text-foreground">Ultimate Sudoku</Text>
			<Text className="text-muted">Home</Text>
		</View>
	);
}


