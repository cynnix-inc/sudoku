# Changelog

## Unreleased

### Features

- feat(ui): classic Seed footer copy-to-clipboard with confirmation toast (refs #63)
## 1.0.1

### Patch Changes

- 15572c3: doc and proc updates
## 1.0.0 (2025-08-20)

### Features

- add toast notifications, improve modal scrolling, and enhance test coverage ([300d6a5](https://github.com/cynnix-inc/sudoku/commit/300d6a5da1b3aae26d187232b10702865b127f89))
- **app:** establish working base with Expo, Router, NativeWind, and theme toggle ([82ca8ac](https://github.com/cynnix-inc/sudoku/commit/82ca8acedec6379149920639d6a92f34edbc59b6))
- **calendar:** add calendar highlight feature and update tests ([9c3c34c](https://github.com/cynnix-inc/sudoku/commit/9c3c34c66a2e7ee7d6a4f50b9064a8644630b4d8))
- **classic:** add Classic screen and navigation link from home (Epic… ([#66](https://github.com/cynnix-inc/sudoku/issues/66)) ([1e01c40](https://github.com/cynnix-inc/sudoku/commit/1e01c4045685a18e87087bbf3441b1f7953c69a8))
- complete project rebuild with full architecture and cursor guardrails ([cdeb9af](https://github.com/cynnix-inc/sudoku/commit/cdeb9af7cc088dbda6c8bba3b12814c18794d2ec))
- confirmation dialogs and related updates ([e9bad31](https://github.com/cynnix-inc/sudoku/commit/e9bad3182c26b2265b7892dff6ebe15ce54e918d))
- enhance mobile experience and improve landing overlay behavior ([074aeb4](https://github.com/cynnix-inc/sudoku/commit/074aeb411d227ea8618f0de672943aed49b1d54b))
- idle controls in settings, headless idle init, help interactions; adjust tests for idle display variants; persist idle settings; wire DOM bindings ([1e0cf4e](https://github.com/cynnix-inc/sudoku/commit/1e0cf4ea912e84053f93ece1b8e736437ff1525b))
- improve board focus stability and enhance game type UI ([63d2d52](https://github.com/cynnix-inc/sudoku/commit/63d2d521c797890a33b2bd64275608e28dbb1313))
- introduce new game types and enhance UI responsiveness ([580288b](https://github.com/cynnix-inc/sudoku/commit/580288b670915103e71f4d6dfb0f7aaf387c6bad))

### Bug Fixes

- **expo:** align Expo SDK 53 deps, pin Metro 0.82.x, set main to expo-router/entry, remove @types/react-native ([648446d](https://github.com/cynnix-inc/sudoku/commit/648446dfdfce26960dba0a9a15ca5cdd227b6069))

### Docs

- clarify MVP layout (numpad single row, tools icons below, hearts-only lives, timer icon-only), seed display policy (numeric; fixture updated), undo/redo lives rule, and same-digit highlight; add QA scenarios and spec tracking (refs #110, #111, #112, #113, #114, #115, #116, #117, #118)

### Reverts

- undo Expo/Metro/Tailwind alignment; restore original entry, Babel config, and layout import ([8dc01df](https://github.com/cynnix-inc/sudoku/commit/8dc01dfe7abc9725c8cac322a5afdd0ade1a41da))
