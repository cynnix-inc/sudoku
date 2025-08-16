import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout(): JSX.Element {
	return (
		<Tabs screenOptions={{ headerShown: true }}>
			<Tabs.Screen name="home" options={{ title: "Home" }} />
			<Tabs.Screen name="settings" options={{ title: "Settings" }} />
		</Tabs>
	);
}


