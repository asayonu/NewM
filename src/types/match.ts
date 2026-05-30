export type MatchResultInput = {
  date: string;
  rank: 1 | 2 | 3 | 4;
  rawScore: number;
  profit: number;
  memo: string;
};

export const RANK_OPTIONS = [1, 2, 3, 4] as const;