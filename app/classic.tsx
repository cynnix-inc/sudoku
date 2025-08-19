import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Board from "./components/Board";
import { initializeGame, applyAction } from "./_game/state";
import type { Digit } from "./_game/types";
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
	const [notesMode, setNotesMode] = useState(false);
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
						setGame((prev) =>
							notesMode
								? applyAction(prev, { type: "note", row: r, col: c, value: lockedDigit, present: true })
								: applyAction(prev, { type: "place", row: r, col: c, value: lockedDigit })
						);
					}
				}}
			/>
			<View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
				<Pressable
					onPress={() => setNotesMode((p) => !p)}
					accessibilityRole="button"
					accessibilityLabel={notesMode ? "Disable notes mode" : "Enable notes mode"}
					style={{
						paddingHorizontal: 12,
						paddingVertical: 6,
						borderWidth: 1,
						borderColor: notesMode ? "#2563eb" : "#d1d5db",
						borderRadius: 6,
						backgroundColor: notesMode ? "#dbeafe" : "#ffffff",
						marginBottom: 8,
					}}
				>
					<Text style={{ fontSize: 14, fontWeight: notesMode ? "700" : "500" }}>{notesMode ? "Notes: ON" : "Notes: OFF"}</Text>
				</Pressable>
			</View>
			<Numpad
				lockedDigit={lockedDigit}
				onDigit={(d) => {
					if (!selected) return;
					const value = lockedDigit ?? d;
					setGame((prev) =>
						notesMode
							? applyAction(prev, { type: "note", row: selected.row, col: selected.col, value, present: true })
							: applyAction(prev, { type: "place", row: selected.row, col: selected.col, value })
					);
				}}
				onToggleLock={(d) => setLockedDigit((prev) => (prev === d ? null : d))}
			/>
		</View>
	);
}


