import React from "react";
import { View, Text, Pressable } from "react-native";
import type { Digit } from "../_game/types";

export type NumpadProps = {
	lockedDigit: Digit | null;
	onDigit: (digit: Digit) => void;
	onToggleLock: (digit: Digit) => void;
};

const digits: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export default function Numpad({ lockedDigit, onDigit, onToggleLock }: NumpadProps) {
	return (
		<View style={{ marginTop: 16 }}>
			<View style={{ flexDirection: "row", flexWrap: "wrap", width: 36 * 9 + 8 }}>
				{digits.map((d) => {
					const isLocked = lockedDigit === d;
					return (
						<View key={d} style={{ marginRight: 4, marginBottom: 8 }}>
							<Pressable
								onPress={() => onDigit(d)}
								onLongPress={() => onToggleLock(d)}
								accessibilityRole="button"
								accessibilityLabel={`Digit ${d}${isLocked ? " locked" : ""}`}
								style={{
									width: 36,
									height: 36,
									alignItems: "center",
									justifyContent: "center",
									borderWidth: 1,
									borderColor: isLocked ? "#2563eb" : "#d1d5db",
									borderRadius: 6,
									backgroundColor: isLocked ? "#dbeafe" : "#ffffff",
								}}
							>
								<Text style={{ fontSize: 18, fontWeight: isLocked ? "700" : "500" }}>{d}</Text>
							</Pressable>
						</View>
					);
				})}
			</View>
			<Text style={{ fontSize: 12, opacity: 0.7 }}>Long-press to lock a digit</Text>
		</View>
	);
}


