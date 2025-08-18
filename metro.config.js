// Metro configuration for Expo
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('metro-config').ConfigT} */
const config = getDefaultConfig(__dirname);

// Avoid Metro trying to open a pseudo path like "<anonymous>" when
// symbolizing stack traces in dev, which can cause ENOENT on Windows.
config.symbolicator = {
	customizeFrame: (frame) => {
		const file = frame.file || '';
		if (
			file === '<anonymous>' ||
			file.startsWith('<') ||
			file.startsWith('eval')
		) {
			return { ...frame, collapse: true };
		}
		return frame;
	},
};

module.exports = config;


