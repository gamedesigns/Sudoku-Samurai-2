import { Grid, GameConfig, CellValue, Position, HintTechnique } from '../types';

type FoundHint = { position: Position, technique: HintTechnique };

// Helper to get candidates for a single cell
const getCandidates = (grid: Grid, row: number, col: number, config: GameConfig): Set<number> => {
    const candidates = new Set<number>();
    if (grid[row][col].value !== 0) return candidates;

    const { size } = config;
    for (let num = 1; num <= size; num++) {
        candidates.add(num);
    }

    // Eliminate from row and column
    for (let i = 0; i < size; i++) {
        candidates.delete(grid[row][i].value);
        candidates.delete(grid[i][col].value);
    }

    // Eliminate from box
    const boxRows = size === 9 ? 3 : 2;
    const boxCols = size / boxRows;
    const startRow = Math.floor(row / boxRows) * boxRows;
    const startCol = Math.floor(col / boxCols) * boxCols;
    for (let r = startRow; r < startRow + boxRows; r++) {
        for (let c = startCol; c < startCol + boxCols; c++) {
            candidates.delete(grid[r][c].value);
        }
    }
    
    // Eliminate from diagonals for X-Sudoku
    if (config.mode === 'X-Sudoku' && size === 9) {
        if (row === col) {
            for(let i=0; i<size; i++) candidates.delete(grid[i][i].value);
        }
        if (row + col === size - 1) {
            for(let i=0; i<size; i++) candidates.delete(grid[i][size - 1 - i].value);
        }
    }

    // Eliminate from hyper regions for Hyper Sudoku
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
                        candidates.delete(grid[r][c].value);
                    }
                }
            }
        }
    }

    return candidates;
};

const findNakedSingle = (grid: Grid, config: GameConfig): FoundHint | null => {
    const { size } = config;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c].value === 0) {
                const candidates = getCandidates(grid, r, c, config);
                if (candidates.size === 1) {
                    return { position: [r, c], technique: 'Naked Single' };
                }
            }
        }
    }
    return null;
};

const findHiddenSingle = (grid: Grid, config: GameConfig): FoundHint | null => {
    const { size } = config;
    const boxRows = size === 9 ? 3 : 2;
    const boxCols = size / boxRows;

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c].value === 0) {
                const candidates = getCandidates(grid, r, c, config);
                for (const candidate of candidates) {
                    // Check row
                    let isHiddenInRow = true;
                    for(let i=0; i<size; i++) {
                        if (i !== c && grid[r][i].value === 0 && getCandidates(grid, r, i, config).has(candidate)) {
                            isHiddenInRow = false;
                            break;
                        }
                    }
                    if (isHiddenInRow) return { position: [r, c], technique: 'Hidden Single' };

                    // Check column
                    let isHiddenInCol = true;
                     for(let i=0; i<size; i++) {
                        if (i !== r && grid[i][c].value === 0 && getCandidates(grid, i, c, config).has(candidate)) {
                            isHiddenInCol = false;
                            break;
                        }
                    }
                    if (isHiddenInCol) return { position: [r, c], technique: 'Hidden Single' };
                    
                    // Check box
                    let isHiddenInBox = true;
                    const startRow = Math.floor(r / boxRows) * boxRows;
                    const startCol = Math.floor(c / boxCols) * boxCols;
                    for (let br = startRow; br < startRow + boxRows; br++) {
                        for (let bc = startCol; bc < startCol + boxCols; bc++) {
                            if ((br !== r || bc !== c) && grid[br][bc].value === 0 && getCandidates(grid, br, bc, config).has(candidate)) {
                                isHiddenInBox = false;
                                break;
                            }
                        }
                        if (!isHiddenInBox) break;
                    }
                    if (isHiddenInBox) return { position: [r, c], technique: 'Hidden Single' };
                }
            }
        }
    }
    return null;
};


export const findHint = (grid: Grid, config: GameConfig): FoundHint | null => {
    let hint: FoundHint | null;

    hint = findNakedSingle(grid, config);
    if (hint) return hint;

    hint = findHiddenSingle(grid, config);
    if (hint) return hint;
    
    // More advanced techniques would be added here
    
    return null;
};