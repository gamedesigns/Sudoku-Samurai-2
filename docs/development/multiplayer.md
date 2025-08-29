# Sudoku Samurai: Multiplayer Design ("The Duel")

This document outlines the design for a competitive multiplayer mode in Sudoku Samurai, called "The Duel". It covers the core concept, mechanics for local pass-and-play, and future considerations for online play.

---

### 1. Core Concept

**The Duel** is a competitive, turn-based mode for 2-4 players on a single device (pass-and-play). Players, each represented by a unique color, race to correctly fill a shared Sudoku board. The objective is to achieve the highest score by the end of the game through speed, accuracy, and strategic play.

-   **Players**: 2, 3, or 4 players.
    -   Player 1: **Samurai Red**
    -   Player 2: **Samurai Blue**
    -   Player 3: **Samurai Green**
    -   Player 4: **Samurai Violet**
-   **Game Grids**: Uses dedicated 6x6 (for faster matches) and 9x9 multiplayer puzzle sets.

---

### 2. Pass-and-Play Mechanics

The gameplay is structured to be fast-paced and fair in a shared-screen environment.

#### A. Setup Flow

1.  **Initiation**: A "Duel" button on the main screen opens the setup modal.
2.  **Configuration**:
    -   **Player Count**: Select 2, 3, or 4 players.
    -   **Player Order**: The initial player order is shown. A "Randomize" button shuffles the order to fairly determine who goes first.
    -   **Puzzle Size**: Choose between a 6x6 or 9x9 grid.
    -   **Difficulty**: Select a puzzle difficulty.
    -   **Timers**: Configure the **Master Timer** for the match and the **Turn Timer** for each player's turn.
3.  **Start**: Clicking "Start Duel" begins the match.

#### B. Turn Structure

The game revolves around a **Master Timer** and individual **Turn Timers**.

1.  **Ready Screen**: Before each turn begins (including the very first one), a modal appears saying, "**[Player Name], Get Ready!**". The player must click "**Start Turn**" to begin, allowing for a comfortable pass of the device.
2.  **Master Timer**: A countdown for the entire match (e.g., 10 minutes for 6x6, 15 minutes for 9x9). The game ends when this timer expires or the puzzle is solved.
3.  **Turn Timer**: Each player gets a short, fixed amount of time for their turn (e.g., **60 seconds**).
4.  **Gameplay Loop**:
    -   The game begins with the "Ready Screen" for Player 1. After they click "Start", their Turn Timer starts counting down.
    -   During their turn, the player can place as many numbers as they can. Each number placed is visually marked with their color.
    -   When the Turn Timer runs out, the board locks, and the "Ready Screen" for the next player appears.
    -   This cycle continues until a win or loss condition is met.

#### C. Interaction & Placement Rules

-   Players **cannot** overwrite a number that has been placed *correctly* by an opponent.
-   Players **can** overwrite an *incorrect* number placed by any player (including themselves). This not only fixes the mistake but also "steals" the cell for the correcting player, marking it with their color.

---

### 3. Scoring System

The scoring system is designed to reward both speed and accuracy.

-   **+10 points**: For placing a correct number in an empty cell.
-   **-5 points**: For placing an incorrect number.
-   **+15 points**: For correcting an opponent's mistake ("stealing" their cell).
-   **+50 points (Bonus)**: Awarded to the player who places the final correct number that solves the puzzle.

The player with the highest score when the game ends is declared the winner.

---

### 4. Required UI Elements

-   **Game Header**:
    -   A dedicated multiplayer header showing the score for each player, using their color as a background.
    -   A clear visual indicator (e.g., a glowing border) around the current player's score.
    -   The master game timer.
-   **Board**:
    -   Placed numbers should have a colored dot in the corner that corresponds to the player who placed them.
-   **Turn Indicator**:
    -   A prominent visual Turn Timer (e.g., a rapidly depleting circular progress bar around the hint button).
-   **Turn Transition**:
    -   A full-screen, unmissable **"[Player Name], Get Ready!"** modal between turns with a "Start Turn" button.
-   **End Game Screen**:
    -   A final results screen (roster) showing the final scores and declaring the winner. It should include a "Play Again" button to start another round with the same players.

---

### 5. Future-Proofing for Online Play

This turn-based, pass-and-play design serves as a perfect foundation for a future online mode.

-   **State Management**: The core game state (grid, scores, current turn) is already structured in a way that can be synchronized over a network.
-   **Network Events**: The local "Ready Screen" event would be replaced with network events (e.g., via WebSockets) to signal the end of a turn to other players' clients.
-   **Turn-Based vs. Real-Time**: A turn-based system is far more resilient to network latency than a real-time free-for-all, making for a more stable and enjoyable online experience. The configurable short turns keep the game feeling fast-paced.