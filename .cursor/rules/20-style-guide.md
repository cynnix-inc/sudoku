# Style Guide Rules

## Code Style
- **TypeScript**: Use strict mode, prefer explicit types
- **React**: Functional components with hooks, avoid class components
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Group imports (React, external, internal, relative)
- **Exports**: Named exports preferred, default exports for main components

## Component Structure
```tsx
// 1. Imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Types
interface ComponentProps {
  title: string;
  onPress?: () => void;
}

// 3. Component
export function Component({ title, onPress }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState(false);

  // 5. Handlers
  const handlePress = () => {
    onPress?.();
  };

  // 6. Render
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
```

## File Organization
- **Components**: One component per file
- **Tests**: Co-located with source: `Component.tsx` + `Component.test.tsx`
- **Types**: Inline for simple types, separate files for complex types
- **Constants**: At top of file or in separate constants file

## CSS/Styling
- **Tailwind**: Use Tailwind classes when possible
- **Custom CSS**: Only when Tailwind doesn't suffice
- **Theme**: Use CSS variables for theming
- **Responsive**: Mobile-first approach with responsive utilities

## Error Handling
- **Try-Catch**: Wrap async operations
- **Error Boundaries**: Use for React component errors
- **User Feedback**: Always provide meaningful error messages
- **Logging**: Use Sentry for production error tracking

## Performance
- **Memoization**: Use React.memo, useMemo, useCallback when beneficial
- **Lazy Loading**: Implement for heavy components
- **Bundle Size**: Monitor and optimize bundle size
- **Images**: Use appropriate formats and sizes

## Accessibility
- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add when needed for screen readers
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Color Contrast**: Maintain WCAG AA compliance
