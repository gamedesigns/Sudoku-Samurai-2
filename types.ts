
export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Grid = CellValue[][];
export type Position = [number, number] | null;

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
}
