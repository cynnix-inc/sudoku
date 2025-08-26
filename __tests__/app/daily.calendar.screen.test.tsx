import React from 'react';
import { render, screen } from '@testing-library/react-native';
import DailyCalendarScreen from '../../app/daily.calendar.screen';

jest.mock('../../app/services/dailyCalendar', () => {
  return {
    buildMonthMatrix: () => [
      [
        { utcDate: '20250101', isInMonth: true, isToday: false, isFuture: false, completed: false },
        { utcDate: '20250102', isInMonth: true, isToday: false, isFuture: false, completed: true },
        { utcDate: '20250103', isInMonth: true, isToday: true, isFuture: false, completed: false },
        { utcDate: '20250104', isInMonth: true, isToday: false, isFuture: true, completed: false },
      ],
    ],
    __esModule: true,
  };
});

describe('DailyCalendarScreen (#39)', () => {
  it('renders days with completion and lock states', () => {
    render(<DailyCalendarScreen />);
    expect(screen.getByLabelText('20250101')).toBeTruthy();
    expect(screen.getByLabelText('20250102 completed')).toBeTruthy();
    expect(screen.getByLabelText('20250103')).toBeTruthy();
    expect(screen.getByLabelText('20250104 locked')).toBeTruthy();
  });
});
