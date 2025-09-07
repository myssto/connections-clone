import { useState, useEffect } from 'react';

export default function GameTimer() {
  const [timer, setTimer] = useState(0);

  const formatTime = (s: number): string => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    const update = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(update);
  });

  return <span>{formatTime(timer)}</span>;
}
