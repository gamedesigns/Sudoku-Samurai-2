# Sudoku Samurai: Development Environment Guide

This document explains the unique development environment of the Google AI Studio, how it differs from a standard local or CI/CD setup, and outlines a recommended workflow for developing in the studio while using GitHub for version control and deployment.

---

### 1. Understanding the Environments

We have worked with two distinct development environments for this project:

#### A. The Google AI Studio Environment

The AI Studio provides a browser-based, "no-build-step" environment. This is a rapid prototyping setup that works differently from most modern web development stacks.

-   **Dependency Management**: It relies on an `<script type="importmap">` in `index.html`. This map tells the browser where to download libraries like React and Lucide directly from a Content Delivery Network (CDN). It is the "package manager" of this environment.
-   **Styling**: It uses the **Tailwind Play CDN**. A script in `index.html` loads the entire Tailwind CSS library and scans the document for class names at runtime. Customizations are configured directly within a `<script>` tag.
-   **Pros**:
    -   **Zero Setup**: No need to install Node.js, `npm`, or any dependencies locally.
    -   **Instant Prototyping**: Code changes are reflected instantly without a build step.
    -   **Self-Contained**: The entire application runs directly from the `index.html` file.
-   **Cons**:
    -   **No Build Process**: Code is not bundled, minified, or optimized for production, leading to slower load times.
    -   **No Direct Git Integration**: The environment is not a Git repository. Code must be manually moved for version control.
    -   **Reliant on External CDNs**: The application will not work offline and depends on third-party services being available.

#### B. The Local / GitHub Actions Environment

This is the standard, professional setup for building modern web applications.

-   **Dependency Management**: It uses a package manager (`npm` or `yarn`) and a `package.json` file to manage a local `node_modules` directory containing all project dependencies.
-   **Build Tool**: It uses a build tool like **Vite**. Vite compiles, bundles, and optimizes all JavaScript, TypeScript, and CSS into a small set of static files in a `dist` directory.
-   **Styling**: Tailwind CSS is installed as a development dependency. During the build process, it scans all source files for class names and generates a small, highly optimized CSS file containing only the styles that are actually used.
-   **Pros**:
    -   **Full Control & Optimization**: Creates a small, fast, production-ready application.
    -   **Offline Development**: Works entirely on your local machine.
    -   **Direct Git Integration**: The project is a Git repository, allowing for seamless version control.
    -   **Industry Standard**: This is how almost all professional web applications are built and deployed.
-   **Cons**:
    -   **Requires Initial Setup**: You must have Node.js and `npm` installed and run `npm install`.

**Conclusion**: The AI Studio is an excellent "live editor" for rapid development, but a build process is necessary for a professional, deployable application. Our initial attempts to mix these two environments caused conflicts.

---

### 2. Recommended Hybrid Workflow

The ideal workflow leverages the strengths of both environments. Use the AI Studio for its rapid development capabilities and a local Git repository for robust version control and deployment.

**Your local machine acts as the "bridge" between the AI Studio and GitHub.**

#### The Workflow Steps:

1.  **Develop in the AI Studio**:
    -   Use the Google AI Studio as your primary coding environment. Write code, test features, and iterate quickly. This is your "workbench".
    -   **IMPORTANT**: Do not add any build-related files (`package.json`, `vite.config.ts`, etc.) to the AI Studio project. Keep it as a pure, no-build-step application.

2.  **Sync to Your Local Git Repository**:
    -   When you have completed a feature or are ready to save your progress, you will manually sync the code to your local machine.
    -   **On your local computer**, open your `Sudoku-Samurai-2` Git repository.
    -   For each file you changed in the AI Studio, **copy the entire content** from the studio.
    -   **Paste the content** into the corresponding file in your local repository, replacing the old content.
    -   If you added or deleted files in the AI Studio, make the same changes in your local repository.

3.  **Commit and Push to GitHub**:
    -   Once your local repository perfectly matches the working version from the AI Studio, use standard Git commands to save it to your GitHub repository.
    -   Open a terminal in your project folder and run:
        ```bash
        # Stage all the changes (updated and deleted files)
        git add .

        # Commit the changes with a clear message
        git commit -m "feat: Implement hint tutor fix and add new puzzles"

        # Push the working version to your GitHub repository
        git push origin main
        ```

4.  **Deployment (from GitHub)**:
    -   Since the code in your GitHub repository is a simple static site (just HTML, CSS, and JS with no build step), deployment is very easy.
    -   **GitHub Pages**: You can configure your repository to deploy directly from the `main` branch. Go to `Settings > Pages`, select `Deploy from a branch`, and choose the `main` branch with the `/ (root)` folder. No build action is needed.
    -   **Netlify / Vercel**: Connect your GitHub repository. In the site settings, leave the "Build command" empty and set the "Publish directory" to the root of your project. The site will be deployed as-is.