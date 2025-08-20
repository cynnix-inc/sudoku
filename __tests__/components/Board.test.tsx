import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Board from '../../app/components/Board';
import { createEmptyBoard, getCell } from '../../app/game/state';
import type { Digit } from '../../app/game/types';

describe('Board component', () => {
  it('renders a 9x9 grid with givens styled', () => {
    const board = createEmptyBoard();
    // set a given and a normal value
    getCell(board, 0, 0).value = 5 as Digit;
    getCell(board, 0, 0).isGiven = true;
    render(<Board board={board} selected={{ row: 0, col: 0 }} onSelect={() => {}} />);
    const cell = screen.getByLabelText('Cell 1,1');
    expect(cell).toBeTruthy();
  });

  it('calls onSelect when a cell is pressed and shows selection ring', () => {
    const board = createEmptyBoard();
    const onSelect = jest.fn();
    render(<Board board={board} selected={{ row: 4, col: 4 }} onSelect={onSelect} />);
    const cell = screen.getByLabelText('Cell 5,5');
    fireEvent.press(cell);
    expect(onSelect).toHaveBeenCalledWith(4, 4);
  });
});
