export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Position = [number, number] | null;

export type Cell = {
  value: CellValue;
  notes: Set<number>;
  isOriginal: boolean;
};

export type Grid = Cell[][];

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Theme {
  bg: string;
  text: string;
  cardBg: string;
  cellBg: string;
  cellEmpty: string;
  cellSelected: string;
  cellHighlight: string;
  border: string;
  borderThick: string;
  button: string;
  numberButton: string;
  modal: string;
  originalText: string;
  userText: string;
  toggleBg: string;
  toggleBgActive: string;
  noteText: string;
}
