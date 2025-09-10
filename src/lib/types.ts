export type Puzzle = {
  id: number;
  date: string;
  answers: PuzzleAnswerGroup[];
};

export type PuzzleGroupLevel = 0 | 1 | 2 | 3;

export type PuzzleAnswerGroup = {
  level: PuzzleGroupLevel;
  group: string;
  members: string[];
};

export type PuzzleCell = {
  id: number;
  groupLevel: PuzzleGroupLevel;
  word: string;
};

export type GuessHistoryEntry = Omit<PuzzleCell, 'word'>;
