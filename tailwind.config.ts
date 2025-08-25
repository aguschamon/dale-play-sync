import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dale-navy': '#1E2139',
        'dale-navy-light': '#252841',
        'dale-navy-lighter': '#2A2D47',
        'dale-purple': '#7C3AED',
        'dale-emerald': '#10B981',
        'dale-amber': '#F59E0B',
        'dale-red': '#EF4444',
        'dale-blue': '#3B82F6',
        'dale-indigo': '#6366F1',
        'dale-gray': '#6B7280',
        'dale-gray-light': '#9CA3AF',
        'dale-gray-dark': '#374151',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
