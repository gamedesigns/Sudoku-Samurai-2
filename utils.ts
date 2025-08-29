import { Cell, CellValue, Grid } from './types';

export const generateInitialGrid = (puzzle: CellValue[][]): Grid => {
  return puzzle.map(row => 
    row.map(value => ({
      value,
      notes: new Set<number>(),
      isOriginal: value !== 0,
    }))
  );
};

export const checkWin = (grid: Grid): boolean => {
  // Check if all cells are filled
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value === 0) {
        return false;
      }
    }
  }

  // Check rows, columns, and 3x3 squares for duplicates
  for (let i = 0; i < 9; i++) {
    const row = new Set<number>();
    const col = new Set<number>();
    const box = new Set<number>();
    
    for (let j = 0; j < 9; j++) {
      // Check row
      const rowVal = grid[i][j].value;
      if (row.has(rowVal)) return false;
      row.add(rowVal);
      
      // Check column
      const colVal = grid[j][i].value;
      if (col.has(colVal)) return false;
      col.add(colVal);

      // Check 3x3 box
      const boxRow = 3 * Math.floor(i / 3) + Math.floor(j / 3);
      const boxCol = 3 * (i % 3) + (j % 3);
      const boxVal = grid[boxRow][boxCol].value;
      if (box.has(boxVal)) return false;
      box.add(boxVal);
    }
  }
  
  return true;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
