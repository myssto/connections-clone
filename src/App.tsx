import GameContainer from './components/game-container';
import connectionsLogo from '/logo.svg';
import { usePuzzles } from './lib/data';
import { useEffect, useState } from 'react';
import type { Puzzle } from './lib/types';

export default function App() {
  const { puzzles, loading, error } = usePuzzles();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (puzzles.length > 0 && !puzzle) {
      setPuzzle(puzzles.at(-1)!);
    }
  }, [puzzles, puzzle]);

  const handleNewGame = () => {
    setPuzzle(puzzles[Math.floor(Math.random() * puzzles.length)]);
    setResetKey((prev) => prev + 1);
  };

  const handleResetGame = () => {
    setResetKey((prev) => prev + 1);
  };

  return (
    <main className="mx-auto w-full max-w-[1050px] p-2 text-center md:p-4">
      <div className="mb-1 flex items-end justify-center gap-1">
        <img src={connectionsLogo} alt="Connections logo" className="size-14" />
        <h1 className="font-karnak-condensed text-5xl">Connections</h1>
      </div>
      <h2>Group words that share a common thread</h2>
      <div className="mx-auto flex flex-1 flex-col space-y-4 py-6 md:w-fit">
        {loading && (
          <span className="m-10 size-10 animate-spin rounded-full border-4 border-blue-300 border-t-transparent" />
        )}
        {error && <span className="text-rose-500">{error}</span>}
        {!loading && puzzle && (
          <>
            <GameContainer puzzle={puzzle} key={resetKey} />
            {/* Meta control buttons */}
            <div className="flex justify-center gap-4">
              <button
                className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold"
                onClick={handleResetGame}
              >
                Reset Game
              </button>
              <button
                className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold"
                onClick={handleNewGame}
              >
                New Game
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
