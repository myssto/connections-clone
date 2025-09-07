import { useState, useEffect } from 'react';

const formatTime = (s: number): string => {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

export default function GameTimer({
  enabled,
  ...props
}: { enabled: boolean } & React.ComponentProps<'span'>) {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const update = enabled
      ? setInterval(() => {
          setTimer((prev) => prev + 1);
        }, 1000)
      : undefined;
    return () => clearInterval(update);
  }, [enabled]);

  return <span {...props}>{formatTime(timer)}</span>;
}
