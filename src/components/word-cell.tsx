export default function WordCell({
  word,
  ...props
}: { word: string } & Omit<React.ComponentProps<'button'>, 'className'>) {
  return (
    <button
      className="flex cursor-pointer items-center justify-center rounded-lg bg-lightest-beige text-xs font-bold wrap-break-word transition-all active:scale-95 data-[selected='true']:bg-darkest-beige data-[selected='true']:text-cool-grey sm:text-sm md:max-h-20 md:max-w-[150px] md:min-w-[150px] md:text-xl"
      {...props}
    >
      {word}
    </button>
  );
}
