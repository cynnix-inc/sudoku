# Testing Rules

## Testing Strategy
- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Coverage Target**: >80% for new code, maintain existing coverage

## Test Structure
```tsx
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Component } from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    const onPress = jest.fn();
    render(<Component title="Test" onPress={onPress} />);
    
    fireEvent.press(screen.getByText('Test'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Tools
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **Playwright**: E2E testing for web
- **MSW**: Mock service worker for API mocking

## Test Organization
- **Unit Tests**: Co-located with source files
- **E2E Tests**: In `tests/e2e/` directory
- **Test Utils**: Shared test helpers in `__tests__/` directories
- **Mocks**: In `__mocks__/` directories

## Mocking Strategy
- **External APIs**: Mock with MSW or jest.mock
- **React Native**: Use `__mocks__/react-native.tsx`
- **Navigation**: Mock Expo Router with test utilities
- **Async Operations**: Mock with jest.fn() and promises

## Test Data
- **Fixtures**: Use consistent test data
- **Factories**: Create test data with helper functions
- **Cleanup**: Reset state between tests
- **Isolation**: Each test should be independent

## Performance Testing
- **Bundle Size**: Monitor bundle size changes
- **Render Performance**: Test component render times
- **Memory Leaks**: Check for memory leaks in long-running tests
- **Async Operations**: Test loading states and timeouts

## Accessibility Testing
- **Screen Reader**: Test with accessibility tools
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Color Contrast**: Verify WCAG compliance
- **Focus Management**: Test focus order and management

## Continuous Integration
- **Pre-commit**: Run unit tests before commit
- **CI Pipeline**: Run all tests on pull requests
- **Coverage Reports**: Generate and track coverage
- **Test Results**: Fail builds on test failures
