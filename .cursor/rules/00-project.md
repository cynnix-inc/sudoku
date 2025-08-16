# Project Overview Rules

## Project Context
- **Name**: Ultimate Sudoku
- **Type**: Single app Expo project with React Native
- **Architecture**: Monorepo with apps/ and packages/ structure
- **Package Manager**: pnpm with workspaces

## Core Principles
1. **Single App Focus**: This is a single Sudoku app, not a multi-app platform
2. **Expo First**: Use Expo SDK and tools when possible
3. **TypeScript**: All new code should be TypeScript
4. **Testing**: Maintain high test coverage with Jest and Playwright
5. **Documentation**: Keep docs updated with code changes

## Project Structure
- `apps/app/` - Main Expo app
- `packages/ui/` - Shared UI components
- `packages/config/` - Shared configuration
- `docs/` - Project documentation
- `tests/` - E2E tests
- `scripts/` - Build and utility scripts

## Key Technologies
- React Native with Expo
- TypeScript
- Tailwind CSS
- Jest for unit tests
- Playwright for E2E tests
- Supabase for backend
- pnpm for package management

## Development Workflow
1. Feature branches from `rebuild/foundation`
2. Tests must pass before merge
3. Use conventional commits
4. Update docs with code changes
5. Run lint and typecheck before committing
