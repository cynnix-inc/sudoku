import React from 'react';
import { render } from '@testing-library/react-native';

export function renderWithProviders(ui: React.ReactElement) {
	return render(ui);
}


