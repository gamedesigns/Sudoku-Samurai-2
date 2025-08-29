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
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value === 0) {
        return false;
      }
    }
  }
  return true; // Simple check, relies on solver for correctness
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const isValidPlacement = (grid: Grid, row: number, col: number, num: CellValue): boolean => {
    for (let x = 0; x < 9; x++) {
        if (grid[row][x].value === num) {
            return false;
        }
    }
    for (let x = 0; x < 9; x++) {
        if (grid[x][col].value === num) {
            return false;
        }
    }
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol].value === num) {
                return false;
            }
        }
    }
    return true;
};

export const solveSudoku = (gridToSolve: Grid): Grid | null => {
    const grid = gridToSolve.map(row => row.map(cell => ({...cell})));

    const findEmpty = (): [number, number] | null => {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c].value === 0) {
                    return [r, c];
                }
            }
        }
        return null;
    };
    
    const solve = (): boolean => {
        const emptyPos = findEmpty();
        if (!emptyPos) {
            return true;
        }
        const [row, col] = emptyPos;

        for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(grid, row, col, num as CellValue)) {
                grid[row][col].value = num as CellValue;
                if (solve()) {
                    return true;
                }
                grid[row][col].value = 0;
            }
        }
        return false;
    };

    if (solve()) {
        return grid;
    }
    return null;
};