export default function WordCell({
  word,
  ...props
}: { word: string } & Omit<React.ComponentProps<'button'>, 'className'>) {
  return (
    <button
      className="flex min-h-18 cursor-pointer items-center justify-center rounded-lg bg-lightest-beige font-bold transition-all active:scale-95 data-[selected='true']:bg-darkest-beige data-[selected='true']:text-cool-grey"
      {...props}
    >
      {word}
    </button>
  );
}
