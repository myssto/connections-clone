import { useEffect, useRef, useState } from 'react';
import type { Puzzle } from './types';

const STORAGE_KEY = 'connections-puzzles';

export function usePuzzles() {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    const loadPuzzles = async () => {
      setLoading(true);
      try {
        const cached = localStorage.getItem(STORAGE_KEY);

        if (cached) {
          const cachedPuzzles = JSON.parse(cached);
          setPuzzles(cachedPuzzles);

          // Check if a day has passed since the most recent cached puzzle date
          if (
            Date.now() - new Date(cachedPuzzles.at(-1)!.date).getTime() <
            86400000
          ) {
            console.log('Cached puzzles are up to date');
            return;
          }

          console.log('Fetching up to date puzzles');
        }

        const res = await fetch(
          'https://raw.githubusercontent.com/Eyefyre/NYT-Connections-Answers/refs/heads/main/connections.json'
        );
        if (res.ok) {
          const fetchedPuzzles: Puzzle[] = await res.json();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fetchedPuzzles));
          setPuzzles(fetchedPuzzles);

          console.log('Fetched and cached up to date puzzles');

          return;
        }

        console.warn('Could not load puzzles, falling back to sample set');
        const sample = await import('../assets/connections.json');
        setPuzzles(sample as Puzzle[]);
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
  });

  return { puzzles, loading, error };
}
