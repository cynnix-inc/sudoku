import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

describe('ClassicScreen storage', () => {
    it('saves and loads progress (board values)', async () => {
        // JSDOM localStorage is available
        const { unmount } = render(<ClassicScreen />);
        const cell12 = screen.getByLabelText('Cell 1,2');
        fireEvent.press(cell12);
        fireEvent.press(screen.getByLabelText('Digit 9'));
        expect(cell12).toHaveTextContent('9');
        // Trigger unmount/mount to simulate reload
        unmount();
        render(<ClassicScreen />);
        // Value should be restored (loaded async)
        await waitFor(() => expect(screen.getByLabelText('Cell 1,2')).toHaveTextContent('9'));
    });
});

