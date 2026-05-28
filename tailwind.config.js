/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:          '#070B14',   // deepest — page canvas
        'bg-2':      '#0D1117',   // secondary surfaces, sidebars
        'bg-3':      '#0F172A',   // cards, panels
        'bg-4':      '#141E30',   // elevated cards, hover states
        accent:      '#10B981',   // enterprise emerald — used sparingly
        'accent-2':  '#34D399',   // soft hover / lighter emerald
        secondary:   '#1E3A5F',   // deep muted navy (not electric)
        ink:         '#F1F5F9',   // primary text
        'ink-2':     '#94A3B8',   // secondary text
        muted:       '#334155',   // dividers, disabled
        neutral:     '#6C7D91',   // placeholders, icons — 4.68:1 on bg
        'neutral-2': '#7A8CA0',   // tertiary labels — 5.71:1 on bg
        cream:       '#070B14',
        line:        'rgba(255,255,255,0.05)',
        success:     '#10B981',
        warning:     '#F59E0B',
        critical:    '#EF4444',
        info:        '#3B82F6',
      },
      borderColor: {
        line:    'rgba(255,255,255,0.05)',
        DEFAULT: 'rgba(255,255,255,0.05)',
      },
      boxShadow: {
        card:     '0 1px 3px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
        'card-md':'0 4px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.25)',
        glass:    '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        elevated: '0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        inter:    ['Inter Tight', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '15%':      { transform: 'translateX(-6px)' },
          '30%':      { transform: 'translateX(6px)' },
          '45%':      { transform: 'translateX(-4px)' },
          '60%':      { transform: 'translateX(4px)' },
          '75%':      { transform: 'translateX(-2px)' },
          '90%':      { transform: 'translateX(2px)' },
        },
        scan: {
          '0%, 100%': { top: '8%' },
          '50%':      { top: '82%' },
        },
        laserScan: {
          '0%':   { transform: 'translateY(0)',     opacity: '1' },
          '45%':  { transform: 'translateY(160px)', opacity: '0.8' },
          '50%':  {                                 opacity: '0' },
          '55%':  { transform: 'translateY(0px)',   opacity: '0' },
          '60%':  {                                 opacity: '1' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
      },
      animation: {
        fadeUp:    'fadeUp 0.4s ease both',
        shimmer:   'shimmer 2s linear infinite',
        shake:     'shake 0.5s ease',
        scan:      'scan 2.4s ease-in-out infinite',
        laserScan: 'laserScan 2.4s ease-in-out infinite',
      },
      backgroundImage: {
        'card-gradient':   'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.00) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      },
    },
  },
  plugins: [],
}