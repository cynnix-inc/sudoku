import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Platform,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Header from './Header';
import Board from './Board';
import Numpad from './Numpad';
import CellInspector from './CellInspector';
import { ThemeContext } from '../_layout';
import { applyAction, initializeGame } from '../game/state';
import type { Difficulty, Digit, GameAction } from '../game/types';
import { isSolved } from '../game/rules';
import { loadProgress, saveProgress } from '../services/storage';
import { recordGameHistory } from '../services/stats';
import { MaterialIcons } from '@expo/vector-icons';

export type BasePuzzle = {
  givens: { row: number; col: number; value: Digit }[];
  difficulty: Difficulty;
  seed?: string;
  maxLives: number;
};

export type GameScreenBaseProps = {
  modeLabel: string;
  getPuzzle: () => BasePuzzle;
  persistenceKey: string;
  onRecord: (difficulty: Difficulty, result: 'win' | 'loss', secondsElapsed: number) => void;
  enableNewGame?: boolean;
};

export default function GameScreenBase({
  modeLabel,
  getPuzzle,
  persistenceKey,
  onRecord,
  enableNewGame = false,
}: GameScreenBaseProps) {
  const theme = useContext(ThemeContext);
  const { width: windowWidth } = useWindowDimensions();

  const initial = useMemo(() => getPuzzle(), []);
  const [givens, setGivens] = useState(initial.givens);
  const [game, setGame] = useState(() =>
    initializeGame(initial.givens, {
      difficulty: initial.difficulty,
      maxLives: initial.maxLives,
    }),
  );
  const [selected, setSelected] = useState<{ row: number; col: number } | null>({ row: 0, col: 0 });
  const [lockedDigit, setLockedDigit] = useState<Digit | null>(null);
  const [notesMode, setNotesMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [chooseVisible, setChooseVisible] = useState(false);
  const [inspect, setInspect] = useState<{ row: number; col: number } | null>(null);
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

  const gameOver = game.livesRemaining === 0;
  const solved = isSolved(game.board);
  const finished = gameOver || solved;
  const hasRecordedRef = useRef(false);

  const selectedDigit: Digit | null = (() => {
    if (!selected) return null;
    const row = game.board[selected.row];
    if (!row) return null;
    const cell = row[selected.col];
    const value = cell?.value;
    return typeof value === 'number' ? (value as Digit) : null;
  })();

  function startNewGame() {
    const next = getPuzzle();
    setGivens(next.givens);
    const reset = initializeGame(next.givens, {
      difficulty: next.difficulty,
      maxLives: next.maxLives,
    });
    setGame(reset);
    setSelected({ row: 0, col: 0 });
    selectedRef.current = { row: 0, col: 0 };
    setLockedDigit(null);
    lockedRef.current = null;
    setNotesMode(false);
    notesModeRef.current = false;
    setPaused(false);
    setSeconds(0);
  }

  function restartWithSameGivens() {
    const reset = initializeGame(givens, {
      difficulty: game.config.difficulty,
      maxLives: game.config.maxLives,
    });
    setGame(reset);
    setSelected({ row: 0, col: 0 });
    selectedRef.current = { row: 0, col: 0 };
    setLockedDigit(null);
    lockedRef.current = null;
    setNotesMode(false);
    notesModeRef.current = false;
    setPaused(false);
    setSeconds(0);
  }

  useEffect(() => {
    if (finished && !hasRecordedRef.current) {
      hasRecordedRef.current = true;
      const result = solved ? 'win' : ('loss' as const);
      onRecord(game.config.difficulty, result, seconds);

      // Record game history entry
      const totalMoves = game.history.past.length;
      void recordGameHistory(
        game.config.difficulty,
        result,
        seconds,
        game.hintState.hintsUsed > 0,
        game.livesRemaining,
        totalMoves,
      );
    }
  }, [
    finished,
    solved,
    game.config.difficulty,
    seconds,
    onRecord,
    game.history.past.length,
    game.hintState.hintsUsed,
    game.livesRemaining,
  ]);

  useEffect(() => {
    if (!finished) {
      hasRecordedRef.current = false;
    }
  }, [finished]);

  useEffect(() => {
    type SavedShape = {
      board?: typeof game.board;
      notesMode?: boolean;
      paused?: boolean;
      lockedDigit?: Digit | null;
      hintState?: { hintsUsed?: number; hintsRemaining?: number };
    };
    loadProgress<SavedShape>(persistenceKey).then((saved) => {
      if (!saved) return;
      if (saved.board) {
        setGame((prev) => ({ ...prev, board: saved.board! }));
      }
      if (
        saved.hintState &&
        (typeof saved.hintState.hintsUsed === 'number' ||
          typeof saved.hintState.hintsRemaining === 'number')
      ) {
        setGame((prev) => ({
          ...prev,
          hintState: {
            ...prev.hintState,
            hintsUsed:
              typeof saved.hintState.hintsUsed === 'number'
                ? saved.hintState.hintsUsed
                : prev.hintState.hintsUsed,
            hintsRemaining:
              typeof saved.hintState.hintsRemaining === 'number'
                ? saved.hintState.hintsRemaining
                : prev.hintState.hintsRemaining,
          },
        }));
      }
      if (typeof saved.notesMode === 'boolean') {
        setNotesMode(saved.notesMode);
        notesModeRef.current = saved.notesMode;
      }
      if (typeof saved.paused === 'boolean') {
        setPaused(saved.paused);
      }
      if (typeof saved.lockedDigit === 'number' || saved.lockedDigit === null) {
        setLockedDigit(saved.lockedDigit ?? null);
        lockedRef.current = saved.lockedDigit ?? null;
      }
    });
  }, [persistenceKey]);

  useEffect(() => {
    saveProgress(persistenceKey, {
      board: game.board,
      notesMode: notesModeRef.current,
      paused,
      lockedDigit: lockedRef.current,
      hintState: {
        hintsUsed: game.hintState.hintsUsed,
        hintsRemaining: game.hintState.hintsRemaining,
      },
    });
  }, [
    game.board,
    paused,
    notesMode,
    lockedDigit,
    game.hintState.hintsUsed,
    game.hintState.hintsRemaining,
    persistenceKey,
  ]);

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
    let removeAppState: (() => void) | undefined;
    try {
      const appStateChange = (nextState: AppStateStatus) => {
        if (nextState === 'background' || nextState === 'inactive') {
          if (timerRef.current) globalThis.clearInterval(timerRef.current);
          setPaused(true);
        }
      };
      const sub = AppState.addEventListener('change', appStateChange);
      removeAppState = () => sub.remove();
    } catch {
      void 0;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyDoc = document as any;
      const onVisibility = () => {
        try {
          const hidden = !!anyDoc.hidden;
          if (hidden) {
            if (timerRef.current) globalThis.clearInterval(timerRef.current);
            setPaused(true);
          }
        } catch {
          void 0;
        }
      };
      const onBlur = () => {
        if (timerRef.current) globalThis.clearInterval(timerRef.current);
        setPaused(true);
      };
      if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
        document.addEventListener('visibilitychange', onVisibility);
        if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
          window.addEventListener('blur', onBlur);
        }
        return () => {
          try {
            document.removeEventListener('visibilitychange', onVisibility);
            if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
              window.removeEventListener('blur', onBlur);
            }
          } catch {
            void 0;
          }
          if (removeAppState) removeAppState();
        };
      }
    } catch {
      void 0;
    }

    return () => {
      if (removeAppState) removeAppState();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    type KeyEvt = {
      key: string;
      preventDefault?: () => void;
      ctrlKey?: boolean;
      metaKey?: boolean;
      altKey?: boolean;
      shiftKey?: boolean;
    };
    const handler = (e: KeyEvt) => {
      const tryPrevent = () => {
        if (typeof e.preventDefault === 'function') e.preventDefault();
      };
      const isCmdOrCtrl = !!(e.ctrlKey || e.metaKey);
      const lowerKey = e.key.toLowerCase();
      if (
        isCmdOrCtrl &&
        (lowerKey === 'r' ||
          lowerKey === 'w' ||
          lowerKey === 'f' ||
          lowerKey === 'p' ||
          lowerKey === 's')
      ) {
        tryPrevent();
        return;
      }
      if (e.key === 'ArrowUp') {
        tryPrevent();
        const curr = selectedRef.current;
        const next = curr ? { row: Math.max(0, curr.row - 1), col: curr.col } : { row: 0, col: 0 };
        selectedRef.current = next;
        setSelected(next);
      } else if (e.key === 'ArrowDown') {
        tryPrevent();
        const curr = selectedRef.current;
        const next = curr ? { row: Math.min(8, curr.row + 1), col: curr.col } : { row: 0, col: 0 };
        selectedRef.current = next;
        setSelected(next);
      } else if (e.key === 'ArrowLeft') {
        tryPrevent();
        const curr = selectedRef.current;
        const next = curr ? { row: curr.row, col: Math.max(0, curr.col - 1) } : { row: 0, col: 0 };
        selectedRef.current = next;
        setSelected(next);
      } else if (e.key === 'ArrowRight') {
        tryPrevent();
        const curr = selectedRef.current;
        const next = curr ? { row: curr.row, col: Math.min(8, curr.col + 1) } : { row: 0, col: 0 };
        selectedRef.current = next;
        setSelected(next);
      } else if (/^[1-9]$/.test(e.key)) {
        tryPrevent();
        const d = Number(e.key) as Digit;
        const value = lockedRef.current ?? d;
        setGame((prev) => {
          const sel = selectedRef.current ?? { row: 0, col: 0 };
          return notesModeRef.current
            ? applyAction(prev, { type: 'note', row: sel.row, col: sel.col, value, present: true })
            : applyAction(prev, { type: 'place', row: sel.row, col: sel.col, value });
        });
      } else if (e.key === 'Backspace') {
        tryPrevent();
        setGame((prev) => {
          const sel = selectedRef.current ?? { row: 0, col: 0 };
          return applyAction(prev, { type: 'erase', row: sel.row, col: sel.col });
        });
      } else if (e.key.toLowerCase() === 'n') {
        tryPrevent();
        const next = !notesModeRef.current;
        notesModeRef.current = next;
        setNotesMode(next);
      } else if (e.key === 'Tab' || e.key === ' ') {
        tryPrevent();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const containerPadding = 12;
  const bandGap = 6;
  const minHit = 44;
  const maxBoardWidth = Math.max(0, windowWidth - containerPadding * 2);
  const computedCell = Math.floor((maxBoardWidth - bandGap * 2) / 9);
  const cellSize = Math.max(minHit, Math.min(48, computedCell || 36));
  const boardPixelWidth = cellSize * 9 + bandGap * 2;

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 12 }}>
      <Header
        mode={modeLabel}
        difficulty={game.config.difficulty}
        livesRemaining={game.livesRemaining}
        seconds={seconds}
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
        boardPixelWidth={boardPixelWidth}
      />

      {enableNewGame ? (
        <View style={{ width: boardPixelWidth, marginBottom: 6, alignItems: 'flex-end' }}>
          <Pressable
            onPress={() => setChooseVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="New game"
            accessibilityHint="Start a new game"
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: theme.isDark ? '#374151' : '#d1d5db',
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 12, color: theme.foreground }}>New</Text>
          </Pressable>
        </View>
      ) : null}

      <Board
        board={game.board}
        selected={selected}
        highlightDigit={(lockedDigit as Digit | null) ?? (selectedDigit as Digit | null)}
        cellSize={cellSize}
        onInspect={(r, c) => {
          // dev-only overlay: enabled in all builds but only discoverable via long-press
          setInspect({ row: r, col: c });
        }}
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

      <Numpad
        lockedDigit={lockedDigit}
        highlightDigit={(lockedDigit as Digit | null) ?? (selectedDigit as Digit | null)}
        cellSize={cellSize}
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

      <View
        testID="tools-row"
        style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}
      >
        <Pressable
          onPress={() => setNotesMode((p) => !p)}
          accessibilityRole="button"
          accessibilityLabel={notesMode ? 'Disable notes mode' : 'Enable notes mode'}
          accessibilityHint="Toggles whether taps add notes instead of placing values"
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
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
            marginRight: 6,
          }}
        >
          <MaterialIcons name="edit" size={20} color={theme.foreground} />
        </Pressable>

        <Pressable
          onPress={() => {
            if (lockedDigit != null) {
              setLockedDigit(null);
              lockedRef.current = null;
              return;
            }
            if (selectedDigit != null) {
              setLockedDigit(selectedDigit);
              lockedRef.current = selectedDigit;
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={
            lockedDigit != null
              ? 'Disable lock'
              : selectedDigit != null
                ? `Enable lock on digit ${selectedDigit}`
                : 'Enable lock'
          }
          accessibilityHint={
            lockedDigit != null
              ? 'Disables digit lock'
              : 'Locks the active digit for repeated placement'
          }
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: lockedDigit != null ? '#60a5fa' : theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor:
              lockedDigit != null
                ? theme.isDark
                  ? '#0b3a64'
                  : '#dbeafe'
                : theme.isDark
                  ? '#0f1115'
                  : '#ffffff',
            marginRight: 6,
          }}
        >
          <MaterialIcons
            name={lockedDigit != null ? 'lock' : 'lock-open'}
            size={20}
            color={theme.foreground}
          />
        </Pressable>

        <Pressable
          onPress={() => {
            if (!selected) return;
            setGame((prev) =>
              applyAction(prev, { type: 'erase', row: selected.row, col: selected.col }),
            );
          }}
          accessibilityRole="button"
          accessibilityLabel="Erase cell"
          accessibilityHint="Clears the value or note in the selected cell"
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
            marginRight: 6,
          }}
        >
          <MaterialIcons name="backspace" size={20} color={theme.foreground} />
        </Pressable>

        <Pressable
          onPress={() => setGame((prev) => applyAction(prev, { type: 'undo' } as GameAction))}
          accessibilityRole="button"
          accessibilityLabel="Undo move"
          accessibilityHint="Reverts the last action without changing lives"
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
            marginRight: 6,
          }}
        >
          <MaterialIcons name="undo" size={20} color={theme.foreground} />
        </Pressable>
        <Pressable
          onPress={() => setGame((prev) => applyAction(prev, { type: 'redo' } as GameAction))}
          accessibilityRole="button"
          accessibilityLabel="Redo move"
          accessibilityHint="Reapplies the last undone action without changing lives"
          style={{
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.isDark ? '#374151' : '#d1d5db',
            borderRadius: 6,
            backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
          }}
        >
          <MaterialIcons name="redo" size={20} color={theme.foreground} />
        </Pressable>
      </View>

      {finished ? (
        <View
          accessibilityLabel={solved ? 'Puzzle solved' : 'Game over'}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: theme.foreground }}>
            {solved ? 'Puzzle solved!' : 'Game over'}
          </Text>
          <View style={{ height: 12 }} />
          <Pressable
            onPress={restartWithSameGivens}
            accessibilityRole="button"
            accessibilityLabel="Restart puzzle"
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: theme.isDark ? '#374151' : '#d1d5db',
              borderRadius: 6,
              backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.foreground }}>
              Restart
            </Text>
          </Pressable>
        </View>
      ) : null}

      {inspect ? (
        <CellInspector
          cell={game.board[inspect.row]![inspect.col]!}
          visible={true}
          onClose={() => setInspect(null)}
        />
      ) : null}

      {enableNewGame && chooseVisible ? (
        <View
          accessibilityLabel="Start new puzzle"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <Pressable
            onPress={() => {
              startNewGame();
              setChooseVisible(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="Start new game"
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: theme.isDark ? '#374151' : '#d1d5db',
              borderRadius: 6,
              backgroundColor: theme.isDark ? '#0f1115' : '#ffffff',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.foreground }}>
              Start new
            </Text>
          </Pressable>
          <View style={{ height: 12 }} />
          <Pressable
            onPress={() => setChooseVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Cancel new game"
            style={{ paddingHorizontal: 12, paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 12, color: theme.foreground, opacity: 0.8 }}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
