# Architecture Rules

## Monorepo Structure
- **Root Level**: Configuration files, scripts, and shared tooling
- **Apps**: Single app in `apps/app/` (Expo React Native)
- **Packages**: Reusable libraries in `packages/`
- **Shared Config**: Common configurations in `packages/config/`

## Package Organization
```
packages/
├── ui/           # Shared UI components and theme
├── config/       # Shared ESLint, Prettier, TypeScript configs
└── [future]      # Additional shared packages as needed
```

## App Architecture
- **Expo Router**: File-based routing in `apps/app/app/`
- **Providers**: Context providers in `apps/app/providers/`
- **Lib**: Utility functions and services in `apps/app/lib/`
- **Components**: App-specific components in `apps/app/app/`

## State Management
- **Local State**: React hooks and useState/useReducer
- **Global State**: React Context for theme, auth, etc.
- **Server State**: Supabase client for backend data
- **Remote Config**: Feature flags via remote configuration

## Data Flow
1. **UI Components** → **Hooks** → **Services** → **Supabase**
2. **Theme Provider** → **CSS Variables** → **Tailwind Classes**
3. **Remote Config** → **Feature Flags** → **Conditional Rendering**

## Testing Strategy
- **Unit Tests**: Jest + React Testing Library for components
- **E2E Tests**: Playwright for critical user flows
- **Test Location**: Co-located with source code
- **Coverage**: Aim for >80% coverage on new code

## Build & Deploy
- **Development**: Expo dev server
- **Testing**: Jest for unit, Playwright for E2E
- **Linting**: ESLint with shared config
- **Formatting**: Prettier with shared config
- **Type Checking**: TypeScript with strict mode
