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
