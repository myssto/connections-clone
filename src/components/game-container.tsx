import type { Puzzle, PuzzleCell } from '../lib/types';
import WordCell from './word-cell';
import GameTimer from './game-timer';
import { useState } from 'react';
import CompletedGroup from './completed-group';

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function GameContainer({ puzzle }: { puzzle: Puzzle }) {
  const [cells, setCells] = useState<PuzzleCell[]>(
    shuffle(
      puzzle.answers.flatMap((group) =>
        group.members.map((word, index) => ({
          id: group.level * 4 + index,
          groupLevel: group.level,
          word,
        }))
      )
    )
  );
  const [mistakes, setMistakes] = useState(0);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [completedGroups, setCompletedGroups] = useState<number[]>([]);

  const handleCellClick = (cellId: number) => {
    if (selectedCells.includes(cellId)) {
      setSelectedCells(selectedCells.filter((id) => id !== cellId));
      return;
    }

    if (selectedCells.length !== 4) {
      setSelectedCells([...selectedCells, cellId].sort());
    }
  };

  const handleSubmit = () => {
    const selection = selectedCells.map(
      (id) => cells.find((cell) => cell.id === id)!
    );
    if (
      selection.every((cell) => cell.groupLevel === selection[0].groupLevel)
    ) {
      // Successful completion
      setCompletedGroups([...completedGroups, selection[0].groupLevel]);
      setCells(cells.filter((cell) => !selectedCells.includes(cell.id)));
      setSelectedCells([]);
    } else {
      // Failed guess
      setMistakes((prev) => prev + 1);
      // Game over
      if (mistakes < 3) {
        return;
      }
    }
  };

  return (
    <>
      {/* Id + timer */}
      <div className="mx-1 mb-2 flex justify-between">
        <span className="flex items-center gap-1">
          Puzzle #{puzzle.id}
          <span className="text-sm text-gray-500">({puzzle.date})</span>
        </span>
        <GameTimer enabled />
      </div>
      {/* Word grid */}
      <div className="grid h-[calc(3*8px+4*23vw)] grid-cols-4 gap-2 md:mx-auto md:h-[calc(3*8px+4*80px)]">
        {completedGroups.map((level) => (
          <CompletedGroup
            key={level}
            group={puzzle.answers.find((g) => g.level === level)!}
          />
        ))}
        {cells.map((cell) => (
          <WordCell
            key={cell.id}
            word={cell.word}
            data-selected={selectedCells.includes(cell.id)}
            onClick={() => handleCellClick(cell.id)}
          />
        ))}
      </div>
      {/* Mistake counter */}
      <div className="flex items-center justify-center gap-2 text-darkest-beige">
        <span>Mistakes Remaining:</span>
        {[...Array(4).keys()].reverse().map((i) => (
          <span
            className={`size-4 rounded-full ${
              i >= mistakes ? 'bg-darkest-beige' : 'bg-inherit'
            }`}
            key={i}
          />
        ))}
      </div>
      {/* Game control buttons */}
      <div className="flex justify-center gap-4">
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold"
          onClick={() => setCells((prev) => shuffle(prev))}
        >
          Shuffle
        </button>
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold transition-colors disabled:cursor-auto disabled:border-gray-500 disabled:text-gray-500"
          disabled={selectedCells.length === 0}
          onClick={() => setSelectedCells([])}
        >
          Deselect
        </button>
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] bg-black font-semibold text-white transition-colors disabled:cursor-auto disabled:border-gray-500 disabled:bg-inherit disabled:text-gray-500"
          disabled={selectedCells.length !== 4}
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </>
  );
}
