import * as HtmlRuntime from "expo-router/html";
// Some expo-router versions don't ship types for html helpers; cast to any to keep TS happy.
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const { Html, Head, Main, Scripts } = HtmlRuntime as any;

export default function Document(): JSX.Element {
	return (
		<Html lang="en">
			<Head>
				<meta name="theme-color" content="#0B0B0C" />
				<meta name="color-scheme" content="dark light" />
				<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
				<meta name="description" content="Ultimate Sudoku - sleek, accessible Sudoku."></meta>
				<link rel="apple-touch-icon" href="/assets/icon.png" />
				<link rel="manifest" href="/manifest.json" />
			</Head>
			<body>
				<Main />
				<Scripts />
			</body>
		</Html>
	);
}


