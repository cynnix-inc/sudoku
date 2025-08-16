// Minimal expo runtime shim to satisfy jest-expo in non-Expo package
// Avoids errors where globalThis.expo is undefined
if (!globalThis.expo) {
	globalThis.expo = {};
}


