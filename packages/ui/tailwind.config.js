/** @type {import('tailwindcss').Config} */
module.exports = {
	presets: [require("./tailwind.preset.js")],
	content: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"../../apps/app/**/*.{js,jsx,ts,tsx}",
	],
	darkMode: ["class", "[data-theme=dark]"],
};


