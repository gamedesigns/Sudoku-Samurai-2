/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light Theme
        'slate-50': '#f8fafc',
        'slate-100': '#f1f5f9',
        'slate-200': '#e2e8f0',
        'slate-300': '#cbd5e1',
        'slate-500': '#64748b',
        'slate-800': '#1e293b',
        'slate-900': '#0f172a',
        'blue-100': '#dbeafe',
        'blue-500': '#3b82f6',
        'blue-600': '#2563eb',
        'blue-700': '#1d4ed8',
        'red-200': '#fecaca',
        'red-700': '#b91c1c',
        'green-100': '#dcfce7',
        'green-300': '#86efac',
        'green-500': '#22c55e',
        // Warm Theme
        'amber-50': '#fffbeb',
        'amber-100': '#fef3c7',
        'amber-200': '#fde68a',
        'amber-300': '#fcd34d',
        'amber-600': '#d97706',
        'amber-800': '#92400e',
        'red-100': '#fee2e2',
        'red-400': '#f87171',
        'red-500': '#ef4444',
        'red-600': '#dc2626',
        // Dark Theme
        'gray-300': '#d1d5db',
        'gray-500': '#6b7280',
        'gray-600': '#4b5563',
        'gray-700': '#374151',
        'gray-800': '#1f2937',
        'gray-900': '#111827',
        'blue-900': '#1e3a8a',
        'cyan-400': '#22d3ee',
        'cyan-500': '#06b6d4',
        'red-900': '#7f1d1d',
        'green-400': '#4ade80',
        'green-700': '#15803d',
      }
    }
  },
  plugins: [],
}
