import GameContainer from './components/game-container';
import connectionsLogo from '/logo.svg';
import puzzles from './assets/connections.json';
import { useState } from 'react';

export default function App() {
  const [puzzle, setPuzzle] = useState(puzzles.at(-1)!);

  return (
    <main className="mx-auto w-full max-w-[1050px] flex-col pb-5 text-center sm:px-5 sm:py-10">
      <img
        src={connectionsLogo}
        alt="Connections logo"
        className="m-auto size-14"
      />
      <h1 className="font-karnak-condensed text-3xl">Connections</h1>
      <h2>Group words that share a common thread</h2>
      <GameContainer puzzle={puzzle} />
      {/* Meta control buttons */}
      <div className="flex justify-center gap-4">
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold"
          onClick={() => setPuzzle(puzzles.find((p) => p.id === puzzle.id)!)}
        >
          Reset Game
        </button>
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold"
          onClick={() =>
            setPuzzle(puzzles[Math.floor(Math.random() * puzzles.length)])
          }
        >
          New Game
        </button>
      </div>
    </main>
  );
}
