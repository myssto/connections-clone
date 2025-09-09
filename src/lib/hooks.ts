import { useEffect, useState } from 'react';

const formatTime = (s: number): string => {
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}`;
};

export function useTimer() {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const update = isActive
      ? setInterval(() => {
          setTime((prev) => prev + 1);
        }, 1000)
      : undefined;
    return () => clearInterval(update);
  }, [isActive]);

  return {
    time,
    formattedTime: formatTime(time),
    disableTimer: () => setIsActive(false),
  };
}
