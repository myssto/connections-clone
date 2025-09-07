export type Puzzle = {
  id: number;
  date: string;
  answers: PuzzleAnswerGroup[];
};

export type PuzzleAnswerGroup = {
  level: number;
  group: string;
  members: string[];
};

export type PuzzleCell = {
  id: number;
  groupLevel: number;
  word: string;
};
