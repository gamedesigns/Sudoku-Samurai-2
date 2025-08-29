import { CellValue, Difficulty } from '../types.ts';

export const CLASSIC_4X4_PUZZLES: Partial<Record<Difficulty, CellValue[][][]>> = {
    Novice: [
        [
            [4,1,2,3],
            [2,3,4,1],
            [1,4,3,2],
            [3,2,1,4]
        ]
    ],
    Easy: [
        [
            [1,2,3,4],
            [3,4,1,2],
            [2,1,4,3],
            [4,3,2,1]
        ],
        [
            [4,3,2,1],
            [1,2,3,4],
            [3,4,1,2],
            [2,1,4,3]
        ]
    ]
};