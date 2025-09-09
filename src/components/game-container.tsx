import type { Puzzle, PuzzleCell } from '../lib/types';
import WordCell from './word-cell';
import GameTimer from './game-timer';
import { useState } from 'react';
import CompletedGroup from './completed-group';
import { cn } from '../lib/util';
import { useAnimate } from 'motion/react';

function shuffle<T>(arr: T[]): T[] {
  return arr
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export default function GameContainer({ puzzle }: { puzzle: Puzzle }) {
  const [scope, animate] = useAnimate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guessHistory, setGuessHistory] = useState<number[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [completedGroups, setCompletedGroups] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
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
    setIsSubmitting(true);
    const selection = selectedCells.map(
      (id) => cells.find((cell) => cell.id === id)!
    );
    const selectionElements = document.querySelectorAll(
      `button[data-selected='true']`
    );

    if (
      selection.every((cell) => cell.groupLevel === selection[0].groupLevel)
    ) {
      // Successful completion
      // setCompletedGroups([...completedGroups, selection[0].groupLevel]);
      // setCells(cells.filter((cell) => !selectedCells.includes(cell.id)));
      // setSelectedCells([]);

      // Confirmation bounce animation
      selectionElements.forEach((el, i) => {
        animate(
          el,
          { y: [0, -10, 0] },
          {
            duration: 0.2,
            delay: i * 0.1,
            ease: 'easeInOut',
            stiffness: 300,
            damping: 30,
          }
        );
      });

      // Move completed group the the top of the grid
      let finishSubmitTimeout;
      const selectedCellsIndices = selectedCells
        .map((id) => cells.findIndex((c) => c.id === id))
        .filter((index) => index > 3);

      // Only if any need to be moved
      if (selectedCellsIndices.length !== 0) {
        finishSubmitTimeout = 900;
        setTimeout(() => {
          const newCells = [...cells];
          selectedCellsIndices
            .sort((a, b) => a - b)
            .forEach((from) => {
              const to = newCells
                .map(({ id }, index) => ({ id, index }))
                .find(({ id }) => !selectedCells.includes(id))!.index;

              [newCells[from], newCells[to]] = [cells[to], cells[from]];
            });

          setCells(newCells);
        }, finishSubmitTimeout);
      } else {
        finishSubmitTimeout = 0;
      }

      setTimeout(() => {
        setIsSubmitting(false);
      }, finishSubmitTimeout);
    } else {
      // Failed guess
      setGuessHistory([...guessHistory, selectedCells]);

      // Error shake animation
      setTimeout(() => setIsSubmitting(false), 1500);
      animate(
        selectionElements,
        { x: [0, -4, 4, -4, 4, -4, 4, 0] },
        {
          duration: 1.5,
          ease: 'easeInOut',
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1],
        }
      );
      setMistakes((prev) => prev + 1);
      // Game over
      // if (mistakes < 3) {
      //   return;
      // }
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
      <div
        ref={scope}
        className="grid h-[calc(3*8px+4*23vw)] grid-cols-4 gap-2 md:mx-auto md:h-[calc(3*8px+4*80px)]"
      >
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
            disabled={isSubmitting}
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
            className={cn(
              'size-4 rounded-full',
              i >= mistakes ? 'bg-darkest-beige' : 'bg-inherit'
            )}
            key={i}
          />
        ))}
      </div>
      {/* Game control buttons */}
      <div className="flex justify-center gap-4">
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold"
          disabled={isSubmitting}
          onClick={() => setCells((prev) => shuffle(prev))}
        >
          Shuffle
        </button>
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold transition-colors disabled:cursor-auto disabled:border-gray-500 disabled:text-gray-500"
          disabled={selectedCells.length === 0 || isSubmitting}
          onClick={() => setSelectedCells([])}
        >
          Deselect
        </button>
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl bg-black font-semibold text-white transition-colors disabled:cursor-auto disabled:border-[1px] disabled:border-gray-500 disabled:bg-inherit disabled:text-gray-500"
          disabled={
            selectedCells.length !== 4 ||
            isSubmitting ||
            guessHistory.some(
              (hist) => JSON.stringify(hist) === JSON.stringify(selectedCells)
            )
          }
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </>
  );
}
