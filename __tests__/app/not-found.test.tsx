import React from 'react';
import { render, screen } from '@testing-library/react-native';
import NotFoundScreen from '../../app/+not-found';

describe('NotFoundScreen', () => {
  it('shows friendly not-found message and a Home action', () => {
    render(<NotFoundScreen />);
    expect(screen.getByText(/page not found/i)).toBeTruthy();
    expect(screen.getByLabelText('Go home')).toBeTruthy();
  });
});
