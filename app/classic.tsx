import React, { useState } from "react";
import { View, Text } from "react-native";
import Board from "./components/Board";
import { initializeGame } from "./game/state";
import type { Digit } from "./game/types";

export default function ClassicScreen() {
	const state = initializeGame(
		[
			{ row: 0, col: 0, value: 5 as Digit },
			{ row: 1, col: 3, value: 2 as Digit },
		],
		{ difficulty: "easy", maxLives: 3 }
	);
	const [selected, setSelected] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 12 }}>
			<Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 4 }}>Classic</Text>
			<Text style={{ fontSize: 16, opacity: 0.7, marginBottom: 12 }}>9×9 Classic Sudoku</Text>
			<Board board={state.board} selected={selected} onSelect={(r, c) => setSelected({ row: r, col: c })} />
		</View>
	);
}


