import { Cell, CellValue, GameConfig, Grid } from './types';

export const generateInitialGrid = (puzzle: CellValue[][], config: GameConfig): Grid => {
  return puzzle.map(row => 
    row.map(value => ({
      value,
      notes: new Set<number>(),
      isOriginal: value !== 0,
    }))
  );
};

export const checkWin = (grid: Grid, config: GameConfig): boolean => {
  const size = config.size;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
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

export const isValidPlacement = (grid: Grid, row: number, col: number, num: CellValue, config: GameConfig): boolean => {
    const { size } = config;
    
    // Check row
    for (let x = 0; x < size; x++) {
        if (grid[row][x].value === num) {
            return false;
        }
    }
    
    // Check column
    for (let x = 0; x < size; x++) {
        if (grid[x][col].value === num) {
            return false;
        }
    }

    // Check box
    const boxRows = size === 9 ? 3 : 2;
    const boxCols = size / boxRows;
    const startRow = row - (row % boxRows);
    const startCol = col - (col % boxCols);
    for (let i = 0; i < boxRows; i++) {
        for (let j = 0; j < boxCols; j++) {
            if (grid[i + startRow][j + startCol].value === num) {
                return false;
            }
        }
    }

    // Check diagonals for X-Sudoku
    if (config.mode === 'X-Sudoku') {
        // Main diagonal
        if (row === col) {
            for (let i = 0; i < size; i++) {
                if (grid[i][i].value === num && i !== row) {
                    return false;
                }
            }
        }
        // Anti-diagonal
        if (row + col === size - 1) {
            for (let i = 0; i < size; i++) {
                if (grid[i][size - 1 - i].value === num && i !== row) {
                    return false;
                }
            }
        }
    }

    return true;
};

export const solveSudoku = (gridToSolve: Grid, config: GameConfig): Grid | null => {
    const grid = gridToSolve.map(row => row.map(cell => ({...cell, notes: new Set(cell.notes)})));
    const size = config.size;

    const findEmpty = (): [number, number] | null => {
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
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

        for (let num = 1; num <= size; num++) {
            if (isValidPlacement(grid, row, col, num as CellValue, config)) {
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