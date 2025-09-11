import GameContainer from './components/game-container';
import Footer from './components/footer';
import connectionsLogo from '/logo.svg';
import { useEffect, useState, type ChangeEvent } from 'react';
import { useTimer, usePuzzles } from './lib/hooks';
import type { Puzzle } from './lib/types';

export default function App() {
  const { puzzles, loading, error, completePuzzle, clearProgress } =
    usePuzzles();
  const { time, formattedTime, disableTimer, resetTimer } = useTimer();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (puzzles.length > 0 && !puzzle) {
      setPuzzle(puzzles.at(-1)!);
      resetTimer();
    }
  }, [puzzles, puzzle, resetTimer]);

  const handleNewGame = () => {
    setPuzzle(puzzles[Math.floor(Math.random() * puzzles.length)]);
    setResetKey((prev) => prev + 1);
    resetTimer();
  };

  const handleResetGame = () => {
    setResetKey((prev) => prev + 1);
    resetTimer();
  };

  const handleSelectPuzzle = (e: ChangeEvent<HTMLSelectElement>) => {
    setPuzzle(puzzles[Number(e.target.value) - 1]);
    setResetKey((prev) => prev + 1);
    resetTimer();
  };

  return (
    <main className="mx-auto flex h-full w-full max-w-[1050px] flex-col items-center p-2 py-4 text-center md:p-4 md:py-6">
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
            <div className="mx-1 mb-2 flex justify-between">
              {/* Puzzle selector */}
              <select
                className="flex items-center gap-1"
                onChange={handleSelectPuzzle}
                value={puzzle.id}
              >
                {puzzles
                  .map(({ id, completed, date }) => (
                    <option key={id} value={id}>
                      {completed && '✅ '}Puzzle #{id} ({date})
                    </option>
                  ))
                  .reverse()}
              </select>
              {/* Timer */}
              <span>{formattedTime}</span>
            </div>
            <GameContainer
              key={resetKey}
              puzzle={puzzle}
              time={time}
              disableTimer={disableTimer}
              onGameWon={() => completePuzzle(puzzle.id)}
            />
            {/* Meta control buttons */}
            <div className="z-10 flex flex-wrap justify-center gap-4">
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
      <Footer onEraserClick={clearProgress} />
    </main>
  );
}
