import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/sudoku-samurai-2/', // IMPORTANT: Change 'sudoku-samurai' to your GitHub repo name
})
