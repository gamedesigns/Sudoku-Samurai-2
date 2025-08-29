# Sudoku Samurai: Deployment Guide

This guide provides step-by-step instructions for building the Sudoku Samurai application and deploying it to popular hosting platforms like GitHub Pages and Netlify.

## Prerequisites

Before you begin, ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed on your machine. This project uses Vite as a build tool, which will be managed via npm.

### Local Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/sudoku-samurai.git
    cd sudoku-samurai
    ```

2.  **Install dependencies:**
    This command reads the `package.json` file and installs all the necessary libraries (React, Vite, Tailwind CSS, etc.).
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This will start a local server, usually on `http://localhost:5173`, with Hot Module Replacement (HMR) for a fast development experience.
    ```bash
    npm run dev
    ```

4.  **Build for Production:**
    When you are ready to deploy, you need to create an optimized production build. This command bundles all the code, optimizes assets, and places the output in a `dist/` directory.
    ```bash
    npm run build
    ```

---

## Deployment Option 1: GitHub Pages (with GitHub Actions)

This is the recommended method for easy, automated deployments directly from your GitHub repository. The project already includes a pre-configured GitHub Actions workflow.

### Step 1: Configure `vite.config.ts`

The `base` path in `vite.config.ts` is crucial for GitHub Pages because projects are typically hosted in a sub-directory (e.g., `https://your-username.github.io/your-repo-name/`).

1.  Open `vite.config.ts`.
2.  Make sure the `base` property matches your repository name. For example, if your repository is named `sudoku-samurai`, the line should be:
    ```typescript
    export default defineConfig({
      // ...
      base: '/sudoku-samurai/',
    })
    ```
3.  Commit and push this change to your repository.

### Step 2: Configure GitHub Repository Settings

1.  Navigate to your repository on GitHub.
2.  Go to **Settings** > **Pages**.
3.  Under "Build and deployment", set the **Source** to **GitHub Actions**.

### Step 3: Push to Deploy

That's it! The workflow file located at `.github/workflows/deploy.yml` is already configured. **Every time you push a change to your `main` branch, GitHub Actions will automatically:**

1.  Check out your code.
2.  Set up Node.js.
3.  Install dependencies (`npm install`).
4.  Build the project (`npm run build`).
5.  Deploy the contents of the `dist/` folder to your GitHub Pages site.

You can monitor the deployment progress in the **Actions** tab of your repository. After the first successful run, your live site will be available at `https://<your-username>.github.io/<your-repo-name>/`.

---

## Deployment Option 2: Netlify

Netlify offers a very user-friendly deployment process with a generous free tier.

### Step 1: Push Your Code to GitHub

Ensure your latest code, including the `package.json` and `vite.config.ts` files, is pushed to your GitHub repository.

### Step 2: Create a New Site on Netlify

1.  Log in to your Netlify account.
2.  Go to your **Team** page and click **"Add new site"** > **"Import an existing project"**.
3.  Connect to **GitHub** as your Git provider.
4.  Select the repository for your Sudoku Samurai project.

### Step 3: Configure Build Settings

Netlify is smart and will likely detect that you are using Vite. It should automatically populate the correct settings, but you should verify them:

-   **Build command:** `npm run build`
-   **Publish directory:** `dist`

If you are deploying from a branch other than `main`, you can specify that here.

### Step 4: Deploy

Click the **"Deploy site"** button. Netlify will pull your code from GitHub, run the build command, and deploy the resulting `dist` folder to its global CDN.

After a few moments, your site will be live on a random Netlify subdomain (e.g., `random-name-12345.netlify.app`). You can configure a custom domain in the site's settings.

Netlify will also automatically redeploy your site every time you push new changes to your connected GitHub branch.
