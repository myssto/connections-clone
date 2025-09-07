import type { PuzzleAnswerGroup } from '../lib/types';

const bgColors = ['bg-yellow', 'bg-green', 'bg-blue', 'bg-maroon'];

export default function CompletedGroup({
  group,
}: {
  group: PuzzleAnswerGroup;
}) {
  return (
    <div
      className={`rounded-lg ${
        bgColors[group.level]
      } col-span-full flex min-h-18 flex-col justify-center shadow-2xs`}
    >
      <strong className="text-lg">{group.group}</strong>
      <span>{group.members.join(', ')}</span>
    </div>
  );
}
