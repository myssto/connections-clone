import { motion, type MotionProps } from 'motion/react';
import { cn } from '../lib/util';

export default function WordCell({
  word,
  className,
  ...props
}: { word: string } & React.ComponentProps<'button'> & MotionProps) {
  return (
    <motion.button
      className={cn(
        "flex cursor-pointer items-center justify-center rounded-lg bg-lightest-beige text-xs font-bold wrap-break-word transition-colors disabled:cursor-auto data-[selected='true']:bg-darkest-beige data-[selected='true']:text-cool-grey sm:text-sm md:max-h-20 md:max-w-[150px] md:min-w-[150px] md:text-xl",
        className
      )}
      layout
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      {word}
    </motion.button>
  );
}
