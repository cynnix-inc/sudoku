import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Board from "./components/Board";
import { initializeGame, applyAction } from "./_game/state";
import type { Digit, GameAction } from "./_game/types";
import Numpad from "./components/Numpad";
import { loadProgress, saveProgress } from "./services/storage";
import { Platform } from "react-native";

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
	const [seconds, setSeconds] = useState(0);
	const [paused, setPaused] = useState(false);
	const timerRef = useRef<ReturnType<typeof globalThis.setInterval> | null>(null);

	// Load progress on mount
	useEffect(() => {
		loadProgress<{ board: typeof game.board }>("sudoku-progress").then((saved) => {
			if (saved && saved.board) {
				setGame((prev) => ({ ...prev, board: saved.board }));
			}
		});
	}, []);

	// Persist on game changes
	useEffect(() => {
		saveProgress("sudoku-progress", { board: game.board });
	}, [game.board]);

	useEffect(() => {
		if (paused) {
			if (timerRef.current) globalThis.clearInterval(timerRef.current);
			return;
		}
		timerRef.current = globalThis.setInterval(() => {
			setSeconds((s) => s + 1);
		}, 1000);
		return () => {
			if (timerRef.current) globalThis.clearInterval(timerRef.current);
		};
	}, [paused]);

	// Idle auto-pause stub: in production, hook into AppState or visibilitychange
	useEffect(() => {
		// no-op stub
	}, []);

	// Keyboard: arrows, digits, N, Backspace (web only)
	useEffect(() => {
		if (Platform.OS !== 'web') return;
		type KeyEvt = { key: string };
		const handler = (e: KeyEvt) => {
			if (e.key === 'ArrowUp') setSelected((curr) => curr ? { row: Math.max(0, curr.row - 1), col: curr.col } : { row: 0, col: 0 });
			else if (e.key === 'ArrowDown') setSelected((curr) => curr ? { row: Math.min(8, curr.row + 1), col: curr.col } : { row: 0, col: 0 });
			else if (e.key === 'ArrowLeft') setSelected((curr) => curr ? { row: curr.row, col: Math.max(0, curr.col - 1) } : { row: 0, col: 0 });
			else if (e.key === 'ArrowRight') setSelected((curr) => curr ? { row: curr.row, col: Math.min(8, curr.col + 1) } : { row: 0, col: 0 });
			else if (/^[1-9]$/.test(e.key)) {
				const d = Number(e.key) as Digit;
				const value = lockedDigit ?? d;
				setGame((prev) => {
					const sel = selected ?? { row: 0, col: 0 };
					return notesMode
						? applyAction(prev, { type: 'note', row: sel.row, col: sel.col, value, present: true })
						: applyAction(prev, { type: 'place', row: sel.row, col: sel.col, value })
				});
			} else if (e.key === 'Backspace') {
				setGame((prev) => {
					const sel = selected ?? { row: 0, col: 0 };
					return applyAction(prev, { type: 'erase', row: sel.row, col: sel.col });
				});
			} else if (e.key.toLowerCase() === 'n') {
				setNotesMode((p) => !p);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [selected, lockedDigit, notesMode]);
	return (
		<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 12 }}>
			{/* Header */}
			<View style={{ alignItems: 'center', marginBottom: 8 }}>
				<Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 4 }}>Classic</Text>
				<Text style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>Mode: Classic • Difficulty: {game.config.difficulty}</Text>
				<Text accessibilityLabel="Elapsed time" style={{ fontSize: 12, opacity: 0.8 }}>
					Time: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")} • Lives: {game.livesRemaining}
				</Text>
			</View>
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
				<View style={{ width: 8 }} />
				<Pressable
					onPress={() => setPaused((p) => !p)}
					accessibilityRole="button"
					accessibilityLabel={paused ? "Resume timer" : "Pause timer"}
					style={{
						paddingHorizontal: 12,
						paddingVertical: 6,
						borderWidth: 1,
						borderColor: paused ? "#2563eb" : "#d1d5db",
						borderRadius: 6,
						backgroundColor: paused ? "#dbeafe" : "#ffffff",
						marginBottom: 8,
					}}
				>
					<Text style={{ fontSize: 14, fontWeight: paused ? "700" : "500" }}>{paused ? "Resume" : "Pause"}</Text>
				</Pressable>
				<View style={{ width: 8 }} />
				<Pressable
					onPress={() => {
						if (!selected) return;
						setGame((prev) => applyAction(prev, { type: "erase", row: selected.row, col: selected.col }));
					}}
					accessibilityRole="button"
					accessibilityLabel="Erase cell"
					style={{
						paddingHorizontal: 12,
						paddingVertical: 6,
						borderWidth: 1,
						borderColor: "#d1d5db",
						borderRadius: 6,
						backgroundColor: "#ffffff",
						marginBottom: 8,
					}}
				>
					<Text style={{ fontSize: 14, fontWeight: "500" }}>Erase</Text>
				</Pressable>
				<View style={{ width: 8 }} />
				<Pressable
					onPress={() => setGame((prev) => applyAction(prev, { type: "undo" } as GameAction))}
					accessibilityRole="button"
					accessibilityLabel="Undo move"
					style={{ paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, backgroundColor: "#ffffff", marginBottom: 8 }}
				>
					<Text style={{ fontSize: 14, fontWeight: "500" }}>Undo</Text>
				</Pressable>
				<View style={{ width: 8 }} />
				<Pressable
					onPress={() => setGame((prev) => applyAction(prev, { type: "redo" } as GameAction))}
					accessibilityRole="button"
					accessibilityLabel="Redo move"
					style={{ paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, backgroundColor: "#ffffff", marginBottom: 8 }}
				>
					<Text style={{ fontSize: 14, fontWeight: "500" }}>Redo</Text>
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
			{/* Seed footer */}
			<Text accessibilityLabel="Seed footer" style={{ fontSize: 12, opacity: 0.6, marginTop: 12 }}>
				Seed: fixed-easy
			</Text>
		</View>
	);
}