import { Cell, CellValue, Difficulty, GameConfig, Grid, GridSize } from './types.ts';

export const generateInitialGrid = (puzzle: CellValue[][], config: GameConfig): Grid => {
  if (!puzzle || !Array.isArray(puzzle)) {
    console.error("Invalid puzzle data provided to generateInitialGrid:", puzzle);
    const size = config.size || 9;
    return Array.from({ length: size }, () => 
      Array.from({ length: size }, () => ({ value: 0, notes: new Set(), isOriginal: false }))
    );
  }
  return puzzle.map(row => {
    if (!row || !Array.isArray(row)) {
        console.error("Invalid row data in puzzle:", row);
        return Array.from({ length: config.size }, () => ({ value: 0, notes: new Set(), isOriginal: false }));
    }
    return row.map(value => ({
      value,
      notes: new Set<number>(),
      isOriginal: value !== 0,
    }))
  });
};

export const createPuzzleFromSolution = (solution: CellValue[][], difficulty: Difficulty, size: GridSize): CellValue[][] => {
    const puzzle = solution.map(row => [...row]);
    let cellsToKeep: number;
    const totalCells = size * size;

    if (size === 4) {
        switch (difficulty) {
            case 'Novice': cellsToKeep = 12; break;
            case 'Easy': cellsToKeep = 9; break;
            default: cellsToKeep = 9;
        }
    } else if (size === 6) {
        switch (difficulty) {
            case 'Novice': cellsToKeep = 28; break;
            case 'Easy': cellsToKeep = 22; break;
            case 'Medium': cellsToKeep = 18; break;
            default: cellsToKeep = 22;
        }
    } else { // size === 9
        switch (difficulty) {
            case 'Novice': cellsToKeep = 45; break;
            case 'Easy': cellsToKeep = 36; break;
            case 'Medium': cellsToKeep = 30; break;
            case 'Hard': cellsToKeep = 24; break;
            default: cellsToKeep = 36;
        }
    }

    const cellsToRemove = totalCells - cellsToKeep;
    let removedCount = 0;
    const cellIndices = Array.from({ length: totalCells }, (_, i) => i);

    // Shuffle indices to remove cells randomly
    for (let i = cellIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cellIndices[i], cellIndices[j]] = [cellIndices[j], cellIndices[i]];
    }

    while (removedCount < cellsToRemove && cellIndices.length > 0) {
        const index = cellIndices.pop()!;
        const row = Math.floor(index / size);
        const col = index % size;
        if (puzzle[row][col] !== 0) {
            puzzle[row][col] = 0;
            removedCount++;
        }
    }

    return puzzle;
};


export const checkWin = (grid: Grid, solutionGrid: Grid): boolean => {
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c].value !== solutionGrid[r][c].value) {
        return false; 
      }
    }
  }
  return true;
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const isValidPlacement = (grid: Grid, row: number, col: number, num: CellValue, config: GameConfig): boolean => {
    const { size } = config;
    if (num === 0) return true;
    
    // Check row
    for (let x = 0; x < size; x++) {
        if (x !== col && grid[row][x].value === num) {
            return false;
        }
    }
    
    // Check column
    for (let x = 0; x < size; x++) {
        if (x !== row && grid[x][col].value === num) {
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
            if ((i + startRow !== row || j + startCol !== col) && grid[i + startRow][j + startCol].value === num) {
                return false;
            }
        }
    }

    // Check diagonals for X-Sudoku
    if (config.mode === 'X-Sudoku' && size === 9) {
        if (row === col) {
            for (let i = 0; i < size; i++) {
                if (i !== row && grid[i][i].value === num) return false;
            }
        }
        if (row + col === size - 1) {
            for (let i = 0; i < size; i++) {
                if (i !== row && grid[i][size - 1 - i].value === num) return false;
            }
        }
    }
    
    // Check hyper regions for Hyper Sudoku
    if (config.mode === 'Hyper Sudoku' && size === 9) {
        const hyperRegions = [
            {rs:1, re:3, cs:1, ce:3},
            {rs:1, re:3, cs:5, ce:7},
            {rs:5, re:7, cs:1, ce:3},
            {rs:5, re:7, cs:5, ce:7},
        ];
        for (const region of hyperRegions) {
            if (row >= region.rs && row <= region.re && col >= region.cs && col <= region.ce) {
                for (let r = region.rs; r <= region.re; r++) {
                    for (let c = region.cs; c <= region.ce; c++) {
                        if ((r !== row || c !== col) && grid[r][c].value === num) {
                            return false;
                        }
                    }
                }
            }
        }
    }

    return true;
};

// This function remains as a fallback for the hint system if it needs to find a number from scratch.
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