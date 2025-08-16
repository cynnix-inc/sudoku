/** @type {import('jest').Config} */
module.exports = {
	preset: undefined,
	cache: false,
	setupFiles: ['<rootDir>/jest.pre-setup.js'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
	moduleNameMapper: {
		'\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/empty.js',
		'\\.(png|jpg|jpeg|gif|webp|svg)$': '<rootDir>/__mocks__/empty.js',
		'^@react-native/js-polyfills/.*$': '<rootDir>/__mocks__/empty.js',
		'^react-native$': '<rootDir>/__mocks__/react-native.tsx',
	},
	transform: {
		'^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
			presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
			plugins: ['@babel/plugin-transform-flow-strip-types']
		}]
	},
	transformIgnorePatterns: [
		'node_modules/(?!(nativewind|tailwind-merge)/)'
	],
	testEnvironment: 'jsdom',
	coverageDirectory: '<rootDir>/coverage',
	collectCoverageFrom: ['<rootDir>/src/components/__tests__/**/*.{ts,tsx}'],
	coverageThreshold: undefined,
	coverageReporters: ['text-summary', 'lcov'],
};


