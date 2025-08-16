module.exports = function (api) {
	api.cache(true);
	const isTest = api.env("test");
	return {
		presets: ["babel-preset-expo", "@babel/preset-react"],
		plugins: [
			"nativewind/babel",
			"@babel/plugin-transform-flow-strip-types",
			...(isTest ? [] : ["react-native-reanimated/plugin"]),
		],
		overrides: [],
	};
};


