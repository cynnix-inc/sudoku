import React, { useState } from "react";
import { View, Text } from "react-native";
import Board from "./components/Board";
import { initializeGame, applyAction } from "./game/state";
import type { Digit } from "./game/types";
import Numpad from "./components/Numpad";

export default function ClassicScreen() {
	const [game, setGame] = useState(() =>
		initializeGame(
			[
				{ row: 0, col: 0, value: 5 as Digit },
				{ row: 1, col: 3, value: 2 as Digit },
			],
			{ difficulty: "easy", maxLives: 3 }
		)
	);
	const [selected, setSelected] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
	const [lockedDigit, setLockedDigit] = useState<Digit | null>(null);
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 12 }}>
			<Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 4 }}>Classic</Text>
			<Text style={{ fontSize: 16, opacity: 0.7, marginBottom: 12 }}>9×9 Classic Sudoku</Text>
			<Board
				board={game.board}
				selected={selected}
				onSelect={(r, c) => {
					setSelected({ row: r, col: c });
					if (lockedDigit != null) {
						setGame((prev) => applyAction(prev, { type: "place", row: r, col: c, value: lockedDigit }));
					}
				}}
			/>
			<Numpad
				lockedDigit={lockedDigit}
				onDigit={(d) => {
					if (!selected) return;
					const value = lockedDigit ?? d;
					setGame((prev) => applyAction(prev, { type: "place", row: selected.row, col: selected.col, value }));
				}}
				onToggleLock={(d) => setLockedDigit((prev) => (prev === d ? null : d))}
			/>
		</View>
	);
}


