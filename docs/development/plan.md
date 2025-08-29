# Sudoku Samurai: Development Plan

-   **Author**: Daniel Sandner
-   **Current Version**: v0.4.0

This document outlines the development roadmap for Sudoku Samurai, translating the ideas from the initial design document into a structured, phased implementation plan.

---

### ✅ Phase 1: Core Experience (v0.1.0 - Complete)

**Goal**: Establish a solid, playable, and aesthetically pleasing foundation for the classic Sudoku game.

-   [x] **UI/UX Foundation**:
    -   [x] Basic 9x9 Sudoku grid rendering.
    -   [x] Fully responsive design for mobile and desktop, ensuring the board and number pads are always correctly sized and square.
    -   [x] Clean, modular code structure using React components (`SudokuBoard`, `NumberPad`, `Header`, `Modal`).
-   [x] **Core Gameplay**:
    -   [x] User input handling.
    -   [x] Highlighting for rows, columns, boxes, and identical numbers.
-   [x] **Customization**:
    -   [x] Switchable Light and Dark themes.
    -   [x] Settings modal to toggle highlighting.

---

### ✅ Phase 2: Gameplay Polish & Core Logic (v0.2.0 - Complete)

**Goal**: Enhance the core gameplay loop with essential features and prepare for advanced modes.

-   [x] **Game Logic**:
    -   [x] Implement a Sudoku validator engine to check for puzzle completion.
    -   [x] Add a game state manager for tracking `new game`, `in progress`, and `completed` states.
    -   [x] Display a win screen/modal upon successful puzzle completion.
-   [x] **User Features**:
    -   [x] Introduce a game timer.
    -   [x] Implement a "Pencil Marks" (notes) feature.
    -   [x] Add a difficulty selector (Easy, Medium, Hard) that loads different puzzles.
-   [x] **UI/UX Refinements**:
    -   [x] Add subtle animations for number placement and board interactions.
    -   [x] Create a "New Game" button/flow.

---

### ✅ Phase 3: The Guiding Sensei - Settings & Hints (v0.4.0 - Complete)

**Goal**: Implement an innovative hint system and add robust settings management.

-   [x] **Settings & Internationalization (i18n)**:
    -   [x] Added "Novice" difficulty level.
    -   [x] Implemented language selection (English, Czech, German).
    -   [x] User settings (theme, language, etc.) are now persisted in the browser.
    -   [x] Added a "Reset to Default" option.
-   [x] **Hint System & Feedback Tools**:
    -   [x] Implemented optional "Mistake Checker" to highlight incorrect entries in real-time.
    -   [x] Implemented "Path of Logic" hints:
        -   [x] **Level 1: Gentle Nudge**: Highlights a solvable cell.
        -   [x] **Level 2: Technique Tutor**: Explains *why* the hint is correct (e.g., "Naked Single", "Hidden Single").
        -   [x] **Level 3: Master's Insight**: Fills the cell with the correct number.

---

### 🚧 Phase 4: The Dojo - New Game Modes (In Progress)

**Goal**: Introduce the first set of innovative and variant game modes.

-   **New Modes**:
    -   [x] **Katana Kutsurogi (Relaxation Mode)**:
        -   [x] Implement smaller grids (4x4, 6x6).
    -   [x] **Variant Dojo (Part 1)**:
        -   [x] Implement **X-Sudoku (Diagonal Sudoku)**, where main diagonals must also be valid.
-   **Upcoming in this Phase**:
    -   Implement **Hyper Sudoku**, with its four extra interior regions.
    -   Add a "Color Sudoku" option as a visual puzzle alternative.

---

### Phase 5: The Master's Path - Advanced Features (Target: v0.5.0)

**Goal**: Add the most complex game modes and advanced UI enhancements.

-   **Advanced Mode**:
    -   **Samurai Siege**: Design and implement the five-grid overlapping puzzle, including the logic for cross-grid constraints.
-   **Advanced UI/UX**:
    -   Implement the **"Swoosh" Input** method (drag-and-drop number entry).
    -   Add the **Phistomefel Ring Overlay** as a toggleable visual aid for advanced players.

---

### Phase 6 & Beyond: The Legend Continues

**Goal**: Introduce competitive and dynamic puzzle elements to ensure long-term engagement.

-   **The Duel (Competitive Mode)**:
    -   Implement a local pass-and-play version first.
    -   *Future*: Scope out online multiplayer functionality.
-   **Elemental Sudoku**:
    -   Implement logic for special cell constraints (Water, Fire, Earth).
    -   Design clear visual indicators for these elemental cells.
-   **Variant Dojo (Part 2)**:
    -   Add **Jigsaw Sudoku** and **Killer Sudoku** to the collection of variants.
-   **Ongoing Tasks**:
    -   Continuously improve accessibility (ARIA labels, keyboard navigation).
    -   Optimize performance for a smooth experience.
    -   Integrate user feedback.
