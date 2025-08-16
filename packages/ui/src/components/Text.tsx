import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { twMerge } from "tailwind-merge";

export type TextProps = RNTextProps & { className?: string };

export function Text({ className, style, ...rest }: TextProps): JSX.Element {
	return <RNText accessibilityRole="text" style={style} className={twMerge("text-foreground", className)} {...rest} />;
}


