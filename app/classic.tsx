import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import Board from './components/Board';
import { initializeGame, applyAction } from './game/state';
import type { Digit, GameAction } from './game/types';
import Numpad from './components/Numpad';
import { loadProgress, saveProgress } from './services/storage';
import { ThemeContext } from './_layout';
import Header from './components/Header';
import SeedFooter from './components/SeedFooter';

export default function ClassicScreen() {
  const theme = useContext(ThemeContext);
  const [game, setGame] = useState(() =>
    initializeGame(
      [
        { row: 0, col: 0, value: 5 as Digit },
        { row: 1, col: 3, value: 2 as Digit },
      ],
      { difficulty: 'easy', maxLives: 3 },
    ),
  );
  const [selected, setSelected] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
  const [lockedDigit, setLockedDigit] = useState<Digit | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof globalThis.setInterval> | null>(null);

  const selectedRef = useRef(selected);
  const lockedRef = useRef(lockedDigit);
  const notesModeRef = useRef(notesMode);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    lockedRef.current = lockedDigit;
  }, [lockedDigit]);
  useEffect(() => {
    notesModeRef.current = notesMode;
  }, [notesMode]);

  useEffect(() => {
    loadProgress<{ board: typeof game.board }>('sudoku-progress').then((saved) => {
      if (saved && saved.board) {
        setGame((prev) => ({ ...prev, board: saved.board }));
      }
    });
  }, []);

  useEffect(() => {
    saveProgress('sudoku-progress', { board: game.board });
  }, [game.board]);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) globalThis.clearInterval(timerRef.current);
      return;
    }
    timerRef.current = globalThis.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) globalThis.clearInterval(timerRef.current);
    };
  }, [paused]);

  useEffect(() => {
    // no-op stub for idle/visibility
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    type KeyEvt = { key: string };
    const handler = (e: KeyEvt) => {
      if (e.key === 'ArrowUp') {
        const curr = selectedRef.current;
        const next = curr ? { row: Math.max(0, curr.row - 1), col: curr.col } : { row: 0, col: 0 };
        selectedRef.current = next;
        setSelected(next);
      } else if (e.key === 'ArrowDown') {
        const curr = selectedRef.current;
        const next = curr ? { row: Math.min(8, curr.row + 1), col: curr.col } : { row: 0, col: 0 };
        selectedRef.current = next;
        setSelected(next);
      } else if (e.key === 'ArrowLeft') {
        const curr = selectedRef.current;
        const next = curr ? { row: curr.row, col: Math.max(0, curr.col - 1) } : { row: 0, col: 0 };
        selectedRef.current = next;
        setSelected(next);
      } else if (e.key === 'ArrowRight') {
        const curr = selectedRef.current;
        const next = curr ? { row: curr.row, col: Math.min(8, curr.col + 1) } : { row: 0, col: 0 };
        selectedRef.current = next;
        setSelected(next);
      } else if (/^[1-9]$/.test(e.key)) {
        const d = Number(e.key) as Digit;
        const value = lockedRef.current ?? d;
        setGame((prev) => {
          const sel = selectedRef.current ?? { row: 0, col: 0 };
          return notesModeRef.current
            ? applyAction(prev, { type: 'note', row: sel.row, col: sel.col, value, present: true })
            : applyAction(prev, { type: 'place', row: sel.row, col: sel.col, value });
        });
      } else if (e.key === 'Backspace') {
        setGame((prev) => {
          const sel = selectedRef.current ?? { row: 0, col: 0 };
          return applyAction(prev, { type: 'erase', row: sel.row, col: sel.col });
        });
      } else if (e.key.toLowerCase() === 'n') {
        const next = !notesModeRef.current;
        notesModeRef.current = next;
        setNotesMode(next);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <Header
        difficulty={game.config.difficulty}
        livesRemaining={game.livesRemaining}
        seconds={seconds}
      />
      <Board
        board={game.board}
        selected={selected}
        onSelect={(r, c) => {
          setSelected({ row: r, col: c });
          selectedRef.current = { row: r, col: c };
          if (lockedDigit != null) {
            setGame((prev) =>
              notesMode
                ? applyAction(prev, {
                    type: 'note',
                    row: r,
                    col: c,
                    value: lockedDigit,
                    present: true,
                  })
                : applyAction(prev, { type: 'place', row: r, col: c, value: lockedDigit }),
            );
          }
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
        <Pressable
          onPress={() => setNotesMode((p) => !p)}
          accessibilityRole="button"
          accessibilityLabel={notesMode ? 'Disable notes mode' : 'Enable notes mode'}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: notesMode ? '#60a5fa' : theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: notesMode
              ? theme.isDark
                ? '#0b3a64'
                : '#dbeafe'
              : theme.isDark
                ? '#0f1115'
                : '#ffffff',
            marginBottom: 8,
          }}
        >
          <Text
            style={{ fontSize: 14, fontWeight: notesMode ? '700' : '500', color: theme.foreground }}
          >
            {notesMode ? 'Notes: ON' : 'Notes: OFF'}
          </Text>
        </Pressable>
        <View style={{ width: 8 }} />
        <Pressable
          onPress={() => setPaused((p) => !p)}
          accessibilityRole="button"
          accessibilityLabel={paused ? 'Resume timer' : 'Pause timer'}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: paused ? '#60a5fa' : theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: paused
              ? theme.isDark
                ? '#0b3a64'
                : '#dbeafe'
              : theme.isDark
                ? '#0f1115'
                : '#ffffff',
            marginBottom: 8,
          }}
        >
          <Text
            style={{ fontSize: 14, fontWeight: paused ? '700' : '500', color: theme.foreground }}
          >
            {paused ? 'Resume' : 'Pause'}
          </Text>
        </Pressable>
        <View style={{ width: 8 }} />
        <Pressable
          onPress={() => {
            if (!selected) return;
            setGame((prev) =>
              applyAction(prev, { type: 'erase', row: selected.row, col: selected.col }),
            );
          }}
          accessibilityRole="button"
          accessibilityLabel="Erase cell"
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: theme.foreground }}>Erase</Text>
        </Pressable>
        <View style={{ width: 8 }} />
        <Pressable
          onPress={() => setGame((prev) => applyAction(prev, { type: 'undo' } as GameAction))}
          accessibilityRole="button"
          accessibilityLabel="Undo move"
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: theme.foreground }}>Undo</Text>
        </Pressable>
        <View style={{ width: 8 }} />
        <Pressable
          onPress={() => setGame((prev) => applyAction(prev, { type: 'redo' } as GameAction))}
          accessibilityRole="button"
          accessibilityLabel="Redo move"
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: theme.foreground }}>Redo</Text>
        </Pressable>
      </View>
      <Numpad
        lockedDigit={lockedDigit}
        onDigit={(d) => {
          if (!selected) return;
          const value = lockedDigit ?? d;
          setGame((prev) =>
            notesMode
              ? applyAction(prev, {
                  type: 'note',
                  row: selected.row,
                  col: selected.col,
                  value,
                  present: true,
                })
              : applyAction(prev, { type: 'place', row: selected.row, col: selected.col, value }),
          );
        }}
        onToggleLock={(d) => setLockedDigit((prev) => (prev === d ? null : d))}
      />
      <SeedFooter seed="fixed-easy" />
    </View>
  );
}
