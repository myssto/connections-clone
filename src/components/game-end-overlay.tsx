import { motion } from 'motion/react';
import { cn, groupBgColors } from '../lib/util';
import type { GuessHistoryEntry } from '../lib/types';

export default function GameEndOverlay({
  won,
  puzzleId,
  time,
  mistakes,
  guessHistory,
  completedGroupsCount,
  onExit,
}: {
  won: boolean;
  puzzleId: number;
  time: number;
  mistakes: number;
  guessHistory: GuessHistoryEntry[][];
  completedGroupsCount: number;
  onExit: () => void;
}) {
  return (
    <>
      {/* Blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute -inset-12 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 flex flex-col items-center gap-2 p-2 text-shadow-md text-shadow-neutral-800/20"
      >
        {/* Exit button
        <img src={xIcon} className="absolute top-0 right-0 p-1" /> */}
        {/* Header */}
        <span className="font-karnak-condensed text-3xl">
          {won ? 'Congratulations!' : 'Next Time!'}
        </span>
        {/* Stats */}
        <p className="max-w-2/3 text-lg">
          You completed{' '}
          <span className="font-semibold text-violet-900">
            Puzzle #{puzzleId}{' '}
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
          {won ? (
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
                  completedGroupsCount > 1 && 'text-emerald-800',
                  completedGroupsCount === 4 && 'text-yellow-500 italic'
                )}
              >
                {completedGroupsCount === 0 && 'no groups'}
                {completedGroupsCount >= 1 &&
                  `${completedGroupsCount} groups`}{' '}
              </span>
              before running out of chances...{' '}
              {completedGroupsCount === 0 && 'Tough luck!'}
              {completedGroupsCount > 0 &&
                completedGroupsCount < 4 &&
                'Better luck next time!'}
              {completedGroupsCount === 4 && 'So close! You almost had it!'}
            </>
          )}
        </p>
        {/* Guess history */}
        <div className="m-2 grid grid-cols-4 gap-1">
          {guessHistory.flatMap((guess, idx) =>
            guess.map(({ groupLevel }, idy) => (
              <span
                key={idx * 4 + idy}
                className={cn(
                  'size-6 rounded-sm border-[1px]',
                  groupBgColors[groupLevel]
                )}
              />
            ))
          )}
        </div>
        {/* View answers button */}
        <button
          className="h-12 w-32 cursor-pointer rounded-4xl border-[1px] border-black font-semibold"
          onClick={onExit}
        >
          View Answers
        </button>
      </motion.div>
    </>
  );
}
