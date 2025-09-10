import WordCell from './word-cell';
import CompletedGroup from './completed-group';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn, groupBgColors, shuffle, sleep } from '../lib/util';
import { resolveElements, useAnimate, motion } from 'motion/react';
import type { Puzzle, PuzzleGroupLevel } from '../lib/types';
import { useTimer } from '../lib/hooks';

type PuzzleCell = {
  id: number;
  groupLevel: PuzzleGroupLevel;
  word: string;
};

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

  // Animation state
  const [scope, animate] = useAnimate();
  const [doCellAnimation, setDoCellAnimation] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Game state
  const [gameOver, setGameOver] = useState(false);
  const { time, formattedTime, disableTimer } = useTimer();
  const [cells, setCells] = useState<PuzzleCell[]>(initialCells);
  const cellsRef = useRef(cells);
  const [selectedCellIds, setSelectedCellIds] = useState<number[]>([]);
  const [guessHistory, setGuessHistory] = useState<number[][]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [displayGroups, setDisplayGroups] = useState<PuzzleGroupLevel[]>([]);
  const [completedGroupsCount, setCompletedGroupsCount] = useState(0);

  const gameWon = mistakes < 4;
  const isMaxSelections = selectedCellIds.length === 4;
  const isNoSelections = selectedCellIds.length === 0;

  useEffect(() => {
    cellsRef.current = cells;
  }, [cells]);

  // -- Animations --
  const animateCellConfirmation = async (els: Element[]) => {
    await els
      .map((el, i) =>
        animate(
          el,
          { y: [0, -15, 0] },
          {
            duration: 0.2,
            delay: i * 0.08,
            ease: 'easeInOut',
          }
        )
      )
      .at(-1)!.finished;

    // Brief pause before next animation
    await sleep(300);
  };

  const animateCellMistake = async (els: Element[]) => {
    await animate(
      els,
      { x: [0, -4, 4, -4, 0] },
      {
        duration: 0.3,
        ease: 'easeInOut',
      }
    ).finished;
  };

  const animateCompletedGroup = useCallback(
    async (groupLevel: PuzzleGroupLevel) => {
      // Find grid indices of cells not in the first row
      setCells((prev) => {
        const groupCells = prev
          .map((cell, index) => ({ ...cell, index }))
          .filter(({ groupLevel: level }) => level === groupLevel);

        const cellIndicesToSwap = groupCells
          .filter(({ index }) => index > 3)
          .map(({ index }) => index);

        // Move all group cells to the top row
        if (cellIndicesToSwap.length === 0) {
          return prev;
        }

        const newCells = [...prev];
        cellIndicesToSwap
          .sort((a, b) => a - b)
          .forEach((from) => {
            // Get the position of the first unselected cell in the top row
            const to = newCells
              .map(({ id }, index) => ({ id, index }))
              .find(({ id: toId }) =>
                groupCells.every(({ id }) => toId !== id)
              )!.index;

            [newCells[from], newCells[to]] = [prev[to], prev[from]];
          });

        return newCells;
      });

      // Wait for the swap animation to finish
      await sleep(400);

      // Prevent cells from animating during removal
      setDoCellAnimation(false);
      await sleep(100);

      // Remove the group cells, add the completed group to the grid
      setCells((prev) => prev.filter((cell) => cell.groupLevel !== groupLevel));
      setDisplayGroups((prev) => [...prev, groupLevel]);

      // Wait for completed group entrance animation
      await sleep(500);
      setDoCellAnimation(true);
    },
    []
  );

  // Handle game over
  const handleGameOver = useCallback(async () => {
    setIsAnimating(true);
    disableTimer();

    // Reveal answers
    if (!gameWon) {
      setSelectedCellIds([]);

      while (true) {
        const nextGroupLevel = cellsRef.current[0]?.groupLevel;
        if (nextGroupLevel == null) {
          break;
        }

        await sleep(500);
        await animateCompletedGroup(nextGroupLevel);
      }
    }

    await sleep(1000);
    setIsAnimating(false);
    setGameOver(true);
  }, [animateCompletedGroup, cellsRef, disableTimer, gameWon]);

  useEffect(() => {
    if (isAnimating || gameOver) {
      return;
    }

    if (completedGroupsCount !== 4 && mistakes !== 4) {
      return;
    }

    handleGameOver();
  }, [completedGroupsCount, gameOver, handleGameOver, isAnimating, mistakes]);

  // -- Events --
  const handleCellClick = (cellId: number) => {
    if (selectedCellIds.includes(cellId)) {
      setSelectedCellIds(selectedCellIds.filter((id) => id !== cellId));
      return;
    }

    if (!isMaxSelections) {
      setSelectedCellIds([...selectedCellIds, cellId].sort());
    }
  };

  const handleSubmit = async () => {
    setIsAnimating(true);
    setGuessHistory([...guessHistory, selectedCellIds]);

    const selectedCells = selectedCellIds.map(
      (id) => cells.find((cell) => cell.id === id)!
    );
    const selectedGroupLevel = selectedCells[0].groupLevel;
    const selectedCellEls = resolveElements(
      `button[data-selected='true']`,
      scope
    );

    // Selection confirmation bounce animation
    await animateCellConfirmation(selectedCellEls);

    if (
      selectedCells.every(({ groupLevel }) => groupLevel === selectedGroupLevel)
    ) {
      // Successful completion
      await animateCompletedGroup(selectedGroupLevel);
      setSelectedCellIds([]);
      setCompletedGroupsCount((prev) => prev + 1);
    } else {
      // Mistake
      await animateCellMistake(selectedCellEls);
      setMistakes((prev) => prev + 1);
    }

    await new Promise((res) => setTimeout(res, 100));
    setIsAnimating(false);
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
                        displayGroups.length > 1 && 'text-emerald-800',
                        displayGroups.length === 4 && 'text-yellow-500 italic'
                      )}
                    >
                      {displayGroups.length === 0 && 'no groups'}
                      {displayGroups.length >= 1 &&
                        `${displayGroups.length} groups`}{' '}
                    </span>
                    before running out of chances...{' '}
                    {displayGroups.length === 0 && 'Tough luck!'}
                    {displayGroups.length > 0 &&
                      displayGroups.length < 4 &&
                      'Better luck next time!'}
                    {displayGroups.length === 4 &&
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
          {displayGroups.map((level) => (
            <CompletedGroup
              key={level}
              group={puzzle.answers.find((g) => g.level === level)!}
            />
          ))}
          {cells.map(({ id, word }) => {
            const selected = selectedCellIds.includes(id);

            return (
              <WordCell
                key={id}
                doAnimation={doCellAnimation}
                word={word}
                disabled={
                  isAnimating || (isMaxSelections && !selected) || gameOver
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
          {Array.from({ length: 4 }, (_, i) => i)
            .reverse()
            .map((i) => (
              <motion.span
                key={i}
                className="size-4 rounded-full bg-darkest-beige"
                animate={i < mistakes ? { scale: [1, 1.25, 0] } : undefined}
                transition={{ duration: 0.35 }}
              />
            ))}
        </div>
        {/* Game control buttons */}
        <div className="flex justify-center gap-4">
          <button
            className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold transition-colors disabled:cursor-auto disabled:border-gray-500 disabled:text-gray-500"
            disabled={isAnimating || gameOver}
            onClick={() => setCells((prev) => shuffle(prev))}
          >
            Shuffle
          </button>
          <button
            className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold transition-colors disabled:cursor-auto disabled:border-gray-500 disabled:text-gray-500"
            disabled={isNoSelections || isAnimating || gameOver}
            onClick={() => setSelectedCellIds([])}
          >
            Deselect
          </button>
          <button
            className="h-12 w-32 cursor-pointer rounded-4xl bg-black font-semibold text-white transition-colors disabled:cursor-auto disabled:border-[1px] disabled:border-gray-500 disabled:bg-inherit disabled:text-gray-500"
            disabled={
              !isMaxSelections ||
              isAnimating ||
              gameOver ||
              guessHistory.some(
                (hist) =>
                  JSON.stringify(hist) === JSON.stringify(selectedCellIds)
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
