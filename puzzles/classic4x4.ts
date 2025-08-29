import { CellValue, Difficulty } from '../types';

export const CLASSIC_4X4_PUZZLES: Partial<Record<Difficulty, CellValue[][][]>> = {
    Easy: [
        [
            [0,2,0,0],
            [1,0,2,0],
            [0,1,0,3],
            [0,0,4,0]
        ],
        [
            [4,0,0,1],
            [0,1,0,0],
            [0,0,2,0],
            [3,0,0,4]
        ]
    ]
};
