import WordCell from './word-cell';
import GameTimer from './game-timer';
import CompletedGroup from './completed-group';
import { useState } from 'react';
import { cn, shuffle } from '../lib/util';
import { resolveElements, useAnimate } from 'motion/react';
import type { Puzzle, PuzzleCell } from '../lib/types';

export default function GameContainer({ puzzle }: { puzzle: Puzzle }) {
  const [scope, animate] = useAnimate();
  const [doCellAnimation, setDoCellAnimation] = useState(true);
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

  const isMaxSelections = selectedCells.length === 4;
  const isNoSelections = selectedCells.length === 0;

  const handleCellClick = (cellId: number) => {
    if (selectedCells.includes(cellId)) {
      setSelectedCells(selectedCells.filter((id) => id !== cellId));
      return;
    }

    if (!isMaxSelections) {
      setSelectedCells([...selectedCells, cellId].sort());
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const selection = selectedCells.map(
      (id) => cells.find((cell) => cell.id === id)!
    );
    const selectionElements = resolveElements(
      `button[data-selected='true']`,
      scope
    );

    // Selection confirmation bounce animation
    selectionElements.forEach((el, i) => {
      animate(
        el,
        { y: [0, -15, 0] },
        {
          duration: 0.2,
          delay: i * 0.08,
          ease: 'easeInOut',
        }
      );
    });
    let timeout = 850;

    if (
      selection.every((cell) => cell.groupLevel === selection[0].groupLevel)
    ) {
      // Find grid indices of selected cells not in the first row
      const selectedCellsIndices = selectedCells
        .map((id) => cells.findIndex((c) => c.id === id))
        .filter((index) => index > 3);

      // If needed, swap selected cells with unselected cells in the top row
      if (selectedCellsIndices.length !== 0) {
        setTimeout(() => {
          const newCells = [...cells];
          selectedCellsIndices
            .sort((a, b) => a - b)
            .forEach((from) => {
              // Get the position of the first unselected cell in the top row
              const to = newCells
                .map(({ id }, index) => ({ id, index }))
                .find(({ id }) => !selectedCells.includes(id))!.index;

              [newCells[from], newCells[to]] = [cells[to], cells[from]];
            });

          setCells(newCells);
        }, timeout);
        timeout += 400;
      }

      // Prevent cells from animating during removal
      setTimeout(() => {
        setDoCellAnimation(false);
      }, timeout);
      timeout += 100;

      // Successful completion
      setTimeout(() => {
        setCells(cells.filter((cell) => !selectedCells.includes(cell.id)));
        setCompletedGroups([...completedGroups, selection[0].groupLevel]);
        setSelectedCells([]);

        setDoCellAnimation(true);
      }, timeout);
      timeout += 500;
    } else {
      // Failed guess
      setGuessHistory([...guessHistory, selectedCells]);

      // Error shake animation
      animate(
        selectionElements,
        { x: [0, -4, 4, -4, 0] },
        {
          duration: 0.3,
          delay: timeout / 1000,
          ease: 'easeInOut',
        }
      );
      timeout += 400;

      // Wait for animations to increment mistakes
      setTimeout(() => {
        setMistakes((prev) => prev + 1);
      }, timeout);

      // Game over
      // if (mistakes < 3) {
      //   return;
      // }
    }

    setTimeout(() => setIsSubmitting(false), timeout);
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
        className="grid h-[calc(3*8px+4*23vw)] grid-cols-4 gap-2 md:mx-auto md:h-auto"
      >
        {completedGroups.map((level) => (
          <CompletedGroup
            key={level}
            group={puzzle.answers.find((g) => g.level === level)!}
          />
        ))}
        {cells.map(({ id, word }) => {
          const selected = selectedCells.includes(id);

          return (
            <WordCell
              key={id}
              doAnimation={doCellAnimation}
              word={word}
              disabled={isSubmitting || (isMaxSelections && !selected)}
              data-selected={selected}
              onClick={() => handleCellClick(id)}
            />
          );
        })}
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
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold transition-colors disabled:cursor-auto disabled:border-gray-500 disabled:text-gray-500"
          disabled={isSubmitting}
          onClick={() => setCells((prev) => shuffle(prev))}
        >
          Shuffle
        </button>
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold transition-colors disabled:cursor-auto disabled:border-gray-500 disabled:text-gray-500"
          disabled={isNoSelections || isSubmitting}
          onClick={() => setSelectedCells([])}
        >
          Deselect
        </button>
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl bg-black font-semibold text-white transition-colors disabled:cursor-auto disabled:border-[1px] disabled:border-gray-500 disabled:bg-inherit disabled:text-gray-500"
          disabled={
            !isMaxSelections ||
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
