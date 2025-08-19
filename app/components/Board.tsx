import React from "react";
import { View, Text, Pressable } from "react-native";
import type { Board as BoardType } from "../_game/types";

export type BoardProps = {
	board: BoardType;
	selected: { row: number; col: number } | null;
	onSelect: (row: number, col: number) => void;
};

export default function Board({ board, selected, onSelect }: BoardProps) {
	return (
		<View>
			{board.map((row, r) => (
				<View key={r} style={{ flexDirection: "row" }}>
					{row.map((cell, c) => {
						const isSelected = selected && selected.row === r && selected.col === c;
						const borderColor = isSelected ? "#2563eb" : "#d1d5db";
						const backgroundColor = cell.isGiven ? "#f4f4f5" : "#ffffff";
						return (
							<Pressable
								key={c}
								onPress={() => onSelect(r, c)}
								accessibilityRole="button"
								accessibilityLabel={`Cell ${r + 1},${c + 1}`}
								style={{
									width: 36,
									height: 36,
									alignItems: "center",
									justifyContent: "center",
									borderWidth: 1,
									borderColor,
									backgroundColor,
									marginRight: c % 3 === 2 ? 6 : 0,
									marginBottom: r % 3 === 2 ? 6 : 0,
								}}
							>
								<Text style={{ fontSize: 18, fontWeight: cell.isGiven ? "700" : "400" }}>
									{cell.value ?? ""}
								</Text>
							</Pressable>
						);
					})}
				</View>
			))}
		</View>
	);
}


