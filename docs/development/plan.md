# Sudoku Samurai: Development Plan

-   **Author**: Daniel Sandner
-   **Current Version**: v0.6.0

This document outlines the development roadmap for Sudoku Samurai, translating the ideas from the initial design document into a structured, phased implementation plan.

---

### ✅ Phase 1: Core Experience (v0.1.0 - Complete)

**Goal**: Establish a solid, playable, and aesthetically pleasing foundation for the classic Sudoku game.

-   [x] **UI/UX Foundation**:
    -   [x] Basic 9x9 Sudoku grid rendering.
    -   [x] Fully responsive design for mobile and desktop.
    -   [x] Clean, modular code structure.
-   [x] **Core Gameplay**:
    -   [x] User input handling & highlighting.
-   [x] **Customization**:
    -   [x] Switchable themes.
    -   [x] Basic settings modal.

---

### ✅ Phase 2: Gameplay Polish & Core Logic (v0.2.0 - Complete)

**Goal**: Enhance the core gameplay loop with essential features.

-   [x] **Game Logic**:
    -   [x] Puzzle completion validator & win state.
-   [x] **User Features**:
    -   [x] Game timer.
    -   [x] Pencil Marks (notes).
    -   [x] Difficulty selector.

---

### ✅ Phase 3: The Guiding Sensei - Settings & Hints (v0.4.0 - Complete)

**Goal**: Implement an innovative hint system and add robust settings management.

-   [x] **Settings & Internationalization (i18n)**:
    -   [x] Added multiple languages.
    -   [x] Persisted user settings.
    -   [x] Added "Reset to Default" option.
-   [x] **Hint System & Feedback Tools**:
    -   [x] Implemented "Mistake Checker".
    -   [x] Implemented multi-stage "Path of Logic" hints, including the "Technique Tutor".

---

### ✅ Phase 4: The Dojo - New Game Modes (v0.5.0 - Complete)

**Goal**: Introduce the first set of innovative and variant game modes.

-   [x] **Architectural Rework**:
    -   [x] Refactored core logic to support dynamic grid sizes and rule sets.
-   [x] **New Modes**:
    -   [x] **Katana Kutsurogi (Relaxation Mode)**: Implemented 4x4 and 6x6 grids.
    -   [x] **Variant Dojo (Part 1)**: Implemented **X-Sudoku**.
-   [x] **UI/UX Polish**:
    -   [x] Refined hint system interaction.
    -   [x] Added a third "Warm" theme.
    -   [x] Improved mobile responsiveness for landscape mode.
    -   [x] Organized puzzle data into a scalable file structure.

---

### 🚧 Phase 5: The Master's Path - Polish & Immersion (In Progress)

**Goal**: Add advanced features, polish, and immersive elements.

-   [x] **Audio System**: Implemented background music, victory music, and sound effects with full user controls.
-   **Upcoming in this Phase**:
    -   Implement **Hyper Sudoku** and **Color Sudoku**.
    -   Implement the **"Swoosh" Input** method (drag-and-drop number entry).
    -   **Samurai Siege**: Design and implement the five-grid overlapping puzzle.
    -   Add the **Phistomefel Ring Overlay** as a toggleable visual aid.

---

### Phase 6 & Beyond: The Legend Continues

**Goal**: Introduce competitive and dynamic puzzle elements to ensure long-term engagement.

-   **The Duel (Competitive Mode)**:
    -   Implement a local pass-and-play version first.
-   **Elemental Sudoku**:
    -   Implement logic for special cell constraints (Water, Fire, Earth).
-   **Variant Dojo (Part 2)**:
    -   Add **Jigsaw Sudoku** and **Killer Sudoku**.
-   **Ongoing Tasks**:
    -   Continuously improve accessibility (ARIA labels, keyboard navigation).
    -   Optimize performance.