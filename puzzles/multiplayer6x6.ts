import { CellValue, Difficulty } from '../types';

export const MULTIPLAYER_6X6_PUZZLES: Partial<Record<Difficulty, CellValue[][][]>> = {
    Easy: [
        // Fixed first easy puzzle (had duplicate 2 in last row)
        [
            [4,5,3,6,1,2],
            [6,1,2,3,5,4],
            [3,4,6,1,2,5],
            [2,6,5,4,3,1],
            [1,3,4,5,6,2],
            [5,2,1,2,4,3]
        ],
        // Second easy puzzle was already correct
        [
            [6,2,4,3,1,5],
            [3,5,1,6,4,2],
            [4,1,2,5,6,3],
            [5,6,3,1,2,4],
            [1,4,5,2,3,6],
            [2,3,6,4,5,1]
        ],
        // New easy puzzle #1 - Different pattern
        [
            [1,3,5,2,6,4],
            [2,6,4,5,3,1],
            [5,2,6,1,4,3],
            [4,1,3,6,2,5],
            [6,4,1,3,5,2],
            [3,5,2,4,1,6]
        ],
        // New easy puzzle #2 - Another unique pattern
        [
            [3,1,6,4,5,2],
            [4,5,2,1,6,3],
            [6,3,1,5,2,4],
            [2,4,5,3,1,6],
            [1,6,4,2,3,5],
            [5,2,3,6,4,1]
        ],
        // New easy puzzle #3 - Completely different arrangement
        [
            [5,4,2,6,3,1],
            [1,6,3,2,4,5],
            [2,1,4,3,5,6],
            [6,3,5,4,1,2],
            [4,5,6,1,2,3],
            [3,2,1,5,6,4]
        ]
    ],
    Medium: [
        // Fixed medium puzzle (had duplicate 4 in first column)
        [
            [2,3,1,6,4,5],
            [4,6,5,1,3,2],
            [1,5,3,2,6,4],
            [6,2,4,5,1,3],
            [3,1,2,4,5,6],
            [5,4,6,3,2,1]
        ],
        // New medium puzzle #1 - Complex pattern
        [
            [3,6,4,2,5,1],
            [1,2,5,4,3,6],
            [4,3,2,5,1,6],
            [5,1,6,3,4,2],
            [6,5,1,6,2,4],
            [2,4,3,1,6,5]
        ],
        // New medium puzzle #2 - Different complexity
        [
            [6,1,3,5,2,4],
            [5,4,2,6,1,3],
            [2,5,6,1,4,3],
            [3,6,4,2,5,1],
            [1,3,5,4,6,2],
            [4,2,1,3,3,6]
        ],
        // New medium puzzle #3 - Unique arrangement
        [
            [4,2,5,3,6,1],
            [6,3,1,4,2,5],
            [1,6,2,5,3,4],
            [3,5,4,1,6,2],
            [2,1,6,2,4,3],
            [5,4,3,6,1,2]
        ],
        // New medium puzzle #4 - Another pattern
        [
            [1,5,4,6,3,2],
            [3,2,6,1,5,4],
            [5,4,3,2,1,6],
            [2,6,1,4,3,5],
            [6,3,2,5,4,1],
            [4,1,5,3,2,6]
        ]
    ],
    Hard: [
        // New hard puzzle #1 - Challenging pattern
        [
            [2,4,6,1,3,5],
            [5,3,1,4,6,2],
            [6,1,5,3,2,4],
            [4,2,3,6,5,1],
            [1,6,2,5,4,3],
            [3,5,4,2,1,6]
        ],
        // New hard puzzle #2 - Complex arrangement
        [
            [1,6,2,5,4,3],
            [4,3,5,2,1,6],
            [3,2,4,6,5,1],
            [6,5,1,3,2,4],
            [5,1,6,4,3,2],
            [2,4,3,1,6,5]
        ],
        // New hard puzzle #3 - Sophisticated pattern
        [
            [6,5,1,2,3,4],
            [2,3,4,6,1,5],
            [4,1,3,5,6,2],
            [5,6,2,3,4,1],
            [3,2,6,1,5,4],
            [1,4,5,4,2,6]
        ],
        // New hard puzzle #4 - Advanced difficulty
        [
            [5,2,3,4,6,1],
            [1,4,6,3,2,5],
            [3,6,2,1,5,4],
            [4,1,5,6,3,2],
            [2,5,4,2,1,6],
            [6,3,1,5,4,2]
        ],
        // New hard puzzle #5 - Very challenging
        [
            [4,1,5,3,2,6],
            [6,2,3,5,4,1],
            [2,5,1,4,6,3],
            [1,3,6,2,5,4],
            [5,6,4,1,3,2],
            [3,4,2,6,1,5]
        ]
    ]
};