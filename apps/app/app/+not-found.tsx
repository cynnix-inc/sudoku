import { Link } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Text } from "@ultimate-sudoku/ui";

export default function NotFound(): JSX.Element {
	return (
		<View className="flex-1 items-center justify-center bg-background">
			<Text className="text-foreground">Page not found</Text>
			<Link href="/" className="text-primary">
				Go home
			</Link>
		</View>
	);
}


