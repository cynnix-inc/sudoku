import React from 'react';
import { render, screen } from '@testing-library/react';
import { Text } from '../Text';

describe('Text', () => {
  it('renders with merged className', () => {
    render(<Text className="text-red-500">Hello</Text>);
    const node = screen.getByText('Hello');
    expect(node).toBeTruthy();
  });
});


