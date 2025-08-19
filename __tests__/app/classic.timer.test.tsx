import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import ClassicScreen from '../../app/classic';

jest.useFakeTimers();

describe('ClassicScreen timer', () => {
    it('increments time and can pause/resume', () => {
        render(<ClassicScreen />);
        expect(screen.getByLabelText('Elapsed time')).toHaveTextContent('Time: 0:00');
        act(() => {
            jest.advanceTimersByTime(3100);
        });
        expect(screen.getByLabelText('Elapsed time')).toHaveTextContent('Time: 0:03');
        const pauseBtn = screen.getByLabelText('Pause timer');
        fireEvent.press(pauseBtn);
        act(() => {
            jest.advanceTimersByTime(3000);
        });
        // Still 3 seconds while paused
        expect(screen.getByLabelText('Elapsed time')).toHaveTextContent('Time: 0:03');
        const resumeBtn = screen.getByLabelText('Resume timer');
        fireEvent.press(resumeBtn);
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(screen.getByLabelText('Elapsed time')).toHaveTextContent('Time: 0:05');
    });
});

