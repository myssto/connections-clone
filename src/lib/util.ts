import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function sleep(ms: number) {
  await new Promise((res) => setTimeout(res, ms));
}

// Pseudo-random number generator
// https://stackoverflow.com/a/47593316
function splitmix32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(arr: T[], seed?: number): T[] {
  const rand = seed ? splitmix32(seed) : Math.random;

  return arr
    .map((value) => ({ value, sort: rand() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

export const groupBgColors = ['bg-yellow', 'bg-green', 'bg-blue', 'bg-maroon'];
