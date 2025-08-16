/** @type {import('tailwindcss').Config} */
const shared = require("../../packages/ui/tailwind.config.js");

module.exports = {
	...shared,
	content: [
		"./app/**/*.{js,jsx,ts,tsx}",
		"../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
	],
};


