import React from "react";
import { View } from "react-native";
import { Text } from "@ultimate-sudoku/ui";

export default function AboutScreen(): JSX.Element {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="text-foreground">About Ultimate Sudoku</Text>
			<Text className="text-muted">Placeholder content only.</Text>
		</View>
	);
}


