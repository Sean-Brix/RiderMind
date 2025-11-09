/**
 * Tailwind Config Snippet for Profile Page
 * Add this to your existing tailwind.config.js theme.extend section
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Matte blue palette for header gradient
        matteBlueStart: '#e1f0ff',
        matteBlueMiddle: '#bfdbfe',
        matteBlueEnd: '#2b6cb0',
        
        // Card backgrounds
        cardBg: '#ffffff',
        cardBgDark: '#1f2937',
        
        // Neutral scale (if not already defined)
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        }
      },
      spacing: {
        // Compact spacing scale for tight layouts
        '4.5': '1.125rem', // 18px
        '5.5': '1.375rem', // 22px
      },
      boxShadow: {
        // Subtle shadows for modern cards
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    }
  }
};
