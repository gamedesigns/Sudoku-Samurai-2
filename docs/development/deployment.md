# Sudoku Samurai: Deployment Guide

This document provides instructions on how to deploy the Sudoku Samurai application to a production environment on **GitHub Pages**.

### The Hybrid Environment Challenge

This project is built to run in two different environments:
1.  **The AI Studio**: A "no-build-step" environment where libraries, CSS, and transpilers are loaded from a CDN at runtime.
2.  **Production (GitHub Pages)**: A standard web environment that requires optimized, pre-compiled static files for performance and reliability.

The old method of "Deploy from a branch" does not work because it fails to compile our TypeScript/JSX code, leading to browser errors. The correct method is to use a **build process** to transform our development code into a production-ready format.

---

### Recommended Deployment: GitHub Actions

The best way to deploy this application is to use the **GitHub Actions workflow** provided in this project. This automates the entire build-and-deploy process.

#### One-Time Setup Steps:

1.  **Create the Workflow File**:
    *   The complete configuration for the workflow is located in the [**`docs/development/deploy_yml.md`**](./deploy_yml.md) file.
    *   Go to your repository on the GitHub website and click the **"Actions"** tab.
    *   Click "set up a workflow yourself".
    *   Name the file **`deploy.yml`**.
    *   **Copy the entire `yaml` block** from `deploy_yml.md` and paste it into the new file on GitHub.
    *   Commit the file directly to your `main` branch.

2.  **Configure the Pages Source**:
    *   In your repository on GitHub, go to the **"Settings"** tab.
    *   In the left sidebar, click on **"Pages"**.
    *   Under the "Build and deployment" section, change the **Source** from "Deploy from a branch" to **"GitHub Actions"**.

#### How It Works

From now on, every time you push a change to your `main` branch, the GitHub Action will automatically:
1.  Check out your code.
2.  Install all necessary dependencies.
3.  **Transform `index.html`**, removing the AI Studio-specific scripts.
4.  Run the Vite build process (`npm run build`) to create an optimized version of your app in a `dist` folder.
5.  Deploy the contents of that `dist` folder to your GitHub Pages site.

Wait a few minutes for the first action to complete. Your live, production-quality application will then be available at the URL shown in your Pages settings.
