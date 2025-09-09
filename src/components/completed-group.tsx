import { cn } from '../lib/util';
import { motion } from 'motion/react';
import type { PuzzleAnswerGroup } from '../lib/types';

const bgColors = ['bg-yellow', 'bg-green', 'bg-blue', 'bg-maroon'];

export default function CompletedGroup({
  group,
}: {
  group: PuzzleAnswerGroup;
}) {
  return (
    <motion.div
      className={cn(
        'col-span-full flex flex-col justify-center rounded-lg text-xs shadow-2xs *:opacity-(--child-opacity) sm:text-lg md:h-20 md:text-xl',
        bgColors[group.level]
      )}
      animate={{
        scale: [1, 1.3, 1.3, 1],
        ['--child-opacity']: [0, 1, 1, 1],
        transition: {
          duration: 0.5,
          times: [0, 0.2, 0.4, 0.5],
        },
      }}
    >
      <strong>{group.group}</strong>
      <span>{group.members.join(', ')}</span>
    </motion.div>
  );
}
