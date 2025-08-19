import React from "react";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import type { Href } from "expo-router";

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
			{(() => {
				const classicHref = "/classic" as unknown as Href;
				return (
					<Link href={classicHref} asChild>
						<Pressable accessibilityRole="button" accessibilityLabel="Go to Classic">
							<Text style={{ fontSize: 18, marginTop: 20, color: "#2563eb" }}>
								Play Classic 9×9
							</Text>
						</Pressable>
					</Link>
				);
			})()}
		</View>
	);
}
