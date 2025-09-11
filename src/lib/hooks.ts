import { useCallback, useEffect, useRef, useState } from 'react';
import type { Puzzle } from './types';

const formatTime = (s: number): string => {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

export function useTimer() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const update = isActive
      ? setInterval(() => {
          setTime((prev) => prev + 1);
        }, 1000)
      : undefined;
    return () => clearInterval(update);
  }, [isActive]);

  return {
    time,
    formattedTime: formatTime(time),
    disableTimer: () => setIsActive(false),
    resetTimer: () => setTime(0),
  };
}

const PUZZLE_STORAGE_KEY = 'connections-puzzles';
const PROGRESS_STORAGE_KEY = 'connections-progress';

function assignProgress(puzzles: Puzzle[], progress: Set<number>) {
  for (const id of progress) {
    if (puzzles.length < id) {
      continue;
    }

    puzzles[id - 1].completed = true;
  }
}

export function usePuzzles() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setProgress] = useState<Set<number>>(new Set());
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const loadPuzzles = async () => {
      setLoading(true);
      try {
        let loadedProgress: Set<number> = new Set();
        const cachedProgressData = localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (cachedProgressData) {
          loadedProgress = new Set(JSON.parse(cachedProgressData));
        }

        let loadedPuzzles: Puzzle[] | undefined;
        const cachedPuzzleData = localStorage.getItem(PUZZLE_STORAGE_KEY);
        if (cachedPuzzleData) {
          const cachedPuzzles = JSON.parse(cachedPuzzleData);
          loadedPuzzles = cachedPuzzles;

          console.log('Loaded cached puzzles');
        }

        // Check if a day has passed since the most recent cached puzzle date
        if (
          !loadedPuzzles ||
          Date.now() - new Date(loadedPuzzles.at(-1)!.date).getTime() < 86400000
        ) {
          const res = await fetch(
            'https://raw.githubusercontent.com/Eyefyre/NYT-Connections-Answers/refs/heads/main/connections.json'
          );

          if (res.ok) {
            const fetchedPuzzles: Puzzle[] = await res.json();
            localStorage.setItem(
              PUZZLE_STORAGE_KEY,
              JSON.stringify(fetchedPuzzles)
            );

            loadedPuzzles = fetchedPuzzles;

            console.log('Fetched and cached up to date puzzles');
          }
        }

        if (!loadedPuzzles) {
          console.warn('Could not load puzzles, falling back to sample set');
          loadedPuzzles = (await import(
            '../assets/connections.json'
          )) as Puzzle[];
        }

        assignProgress(loadedPuzzles, loadedProgress);
        setProgress(loadedProgress);
        setPuzzles(loadedPuzzles);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : 'Failed to load puzzles :('
        );
      } finally {
        setLoading(false);
      }
    };

    loadPuzzles();
  }, []);

  const completePuzzle = useCallback((id: number) => {
    setProgress((prev) => {
      const newProgress = prev.add(id);
      localStorage.setItem(
        PROGRESS_STORAGE_KEY,
        JSON.stringify([...newProgress])
      );
      return newProgress;
    });
    setPuzzles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: true } : p))
    );
  }, []);

  const clearProgress = useCallback(() => {
    setProgress(new Set<number>());
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    setPuzzles((prev) => prev.map((p) => ({ ...p, completed: false })));
  }, []);

  return { puzzles, loading, error, completePuzzle, clearProgress };
}
