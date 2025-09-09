import WordCell from './word-cell';
import CompletedGroup from './completed-group';
import { useEffect, useState } from 'react';
import { cn, groupBgColors, shuffle } from '../lib/util';
import { resolveElements, useAnimate, motion } from 'motion/react';
import type { Puzzle, PuzzleCell } from '../lib/types';
import { useTimer } from '../lib/hooks';

export default function GameContainer({ puzzle }: { puzzle: Puzzle }) {
  const initialCells = shuffle(
    puzzle.answers.flatMap((group) =>
      group.members.map((word, index) => ({
        id: group.level * 4 + index,
        groupLevel: group.level,
        word,
      }))
    )
  );

  const [scope, animate] = useAnimate();
  const [doCellAnimation, setDoCellAnimation] = useState(true);
  const { time, formattedTime, disableTimer } = useTimer();
  const [gameOver, setGameOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guessHistory, setGuessHistory] = useState<number[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [completedGroups, setCompletedGroups] = useState<number[]>([]);
  const [selectedCells, setSelectedCells] = useState<number[]>([]);
  const [cells, setCells] = useState<PuzzleCell[]>(initialCells);

  const gameWon = mistakes < 4;
  const nCompletedGroups = completedGroups.length;
  const isMaxSelections = selectedCells.length === 4;
  const isNoSelections = selectedCells.length === 0;

  useEffect(() => {
    if (isSubmitting) {
      return;
    }

    if (nCompletedGroups === 4 || mistakes === 4) {
      setGameOver(true);
      disableTimer();
    }
  }, [isSubmitting, nCompletedGroups, mistakes, disableTimer]);

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
    setGuessHistory([...guessHistory, selectedCells]);

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
    }

    setTimeout(() => {
      setIsSubmitting(false);
    }, timeout + 100);
  };

  return (
    <>
      {/* Id + timer */}
      <div className="mx-1 mb-2 flex justify-between">
        <span className="flex items-center gap-1">
          Puzzle #{puzzle.id}
          <span className="text-sm text-gray-500">({puzzle.date})</span>
        </span>
        <span>{formattedTime}</span>
      </div>
      <div className="relative flex flex-col space-y-4">
        {/* End of game overlay */}
        {gameOver && (
          <>
            {/* Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -inset-12 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center gap-2 p-2 text-shadow-md text-shadow-neutral-800/20"
            >
              {/* Header */}
              <span className="font-karnak-condensed text-3xl">
                {gameWon ? 'Congratulations!' : 'Next Time!'}
              </span>
              {/* Stats */}
              <p className="max-w-2/3 text-lg">
                You completed{' '}
                <span className="font-semibold text-violet-900">
                  Puzzle #{puzzle.id}{' '}
                </span>
                in{' '}
                <span className="font-semibold">
                  {!!Math.floor(time / 60) &&
                    `${Math.floor(time / 60)} minute(s) and`}{' '}
                  {time % 60} second(s).{' '}
                </span>
                {time < 180 && "You're a speed demon!"}
                {time >= 180 && time < 600 && 'No sweat!'}
                {time >= 600 && 'You thought about it a lot!'}
                <br />
                You made{' '}
                <span className="font-semibold text-teal-900">
                  {guessHistory.length} guesses
                </span>
                {', '}
                {gameWon ? (
                  <>
                    {'and had '}
                    <span
                      className={cn(
                        'font-semibold text-rose-600',
                        mistakes === 0 && 'text-yellow-500 italic',
                        mistakes === 1 && 'text-emerald-800'
                      )}
                    >
                      {mistakes === 0 && 'no mistakes!'}
                      {mistakes === 1 && 'only one mistake!'}
                      {mistakes > 1 && `${mistakes} mistakes.`}
                    </span>{' '}
                    {mistakes === 0 && 'It was a perfect game!'}
                    {mistakes === 1 && 'Great job!'}
                    {mistakes === 2 && 'Well done!'}
                    {mistakes === 3 && 'It was close, but you made it!'}
                  </>
                ) : (
                  <>
                    {'and completed '}
                    <span
                      className={cn(
                        'font-semibold text-rose-600',
                        completedGroups.length > 1 && 'text-emerald-800',
                        completedGroups.length === 4 && 'text-yellow-500 italic'
                      )}
                    >
                      {completedGroups.length === 0 && 'no groups'}
                      {completedGroups.length >= 1 &&
                        `${completedGroups.length} groups`}{' '}
                    </span>
                    before running out of chances...{' '}
                    {completedGroups.length === 0 && 'Tough luck!'}
                    {completedGroups.length > 0 &&
                      completedGroups.length < 4 &&
                      'Better luck next time!'}
                    {completedGroups.length === 4 &&
                      'So close! You almost had it!'}
                  </>
                )}
              </p>
              {/* Guess history */}
              <div className="mt-2 grid grid-cols-4 gap-1">
                {guessHistory.flatMap((guess, idx) =>
                  guess.map((cellId, idy) => {
                    const groupLevel = initialCells.find(
                      (c) => c.id === cellId
                    )!.groupLevel;

                    return (
                      <span
                        key={idx * 4 + idy}
                        className={cn(
                          'size-6 rounded-sm border-[1px]',
                          groupBgColors[groupLevel]
                        )}
                      />
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
        {/* Word grid */}
        <div
          ref={scope}
          className="mb-2 grid h-[calc(3*8px+4*23vw)] grid-cols-4 gap-2 md:mx-auto md:h-auto"
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
                disabled={
                  isSubmitting || (isMaxSelections && !selected) || gameOver
                }
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
            disabled={isSubmitting || gameOver}
            onClick={() => setCells((prev) => shuffle(prev))}
          >
            Shuffle
          </button>
          <button
            className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold transition-colors disabled:cursor-auto disabled:border-gray-500 disabled:text-gray-500"
            disabled={isNoSelections || isSubmitting || gameOver}
            onClick={() => setSelectedCells([])}
          >
            Deselect
          </button>
          <button
            className="h-12 w-32 cursor-pointer rounded-4xl bg-black font-semibold text-white transition-colors disabled:cursor-auto disabled:border-[1px] disabled:border-gray-500 disabled:bg-inherit disabled:text-gray-500"
            disabled={
              !isMaxSelections ||
              isSubmitting ||
              gameOver ||
              guessHistory.some(
                (hist) => JSON.stringify(hist) === JSON.stringify(selectedCells)
              )
            }
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
}
