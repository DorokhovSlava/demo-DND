/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== DUNGEON CRAWL DARK THEME =====

        // Backgrounds — deep darkness progression
        dungeon: {
          abyss:   '#0c0c12',   // Deepest background
          deep:    '#101018',   // Main app background
          DEFAULT: '#151520',   // Card/panel backgrounds
          medium:  '#1c1c30',   // Elevated surfaces
          light:   '#24243a',   // Hover/active surfaces
          surface: '#2e2e48',   // Highest elevation
          overlay: '#383858',   // Tooltips, dropdowns
        },

        // Text — warm parchment tones (brighter)
        text: {
          primary:   '#f0e8d8', // Main text (warm cream, brighter)
          secondary: '#b8a890', // Secondary (muted gold, brighter)
          dim:       '#7a6e60', // Disabled, placeholders
          inverse:   '#151520', // Text on light backgrounds
        },

        // Gold accent — the signature color
        gold: {
          bright:  '#f0c850',   // Highlights, active states
          DEFAULT: '#daa520',   // Primary gold
          muted:   '#8b6914',   // Borders, subtle accents
          dark:    '#5a4410',   // Dark gold for backgrounds
          glow:    'rgba(218, 165, 32, 0.3)',
        },

        // Health system
        health: {
          high:    '#4ade80',   // > 60% HP
          mid:     '#fbbf24',   // 30-60% HP
          low:     '#ef4444',   // < 30% HP
          critical:'#dc2626',   // < 10% HP
        },

        // Mana
        mana: {
          DEFAULT: '#60a5fa',
          bright:  '#93c5fd',
          dark:    '#3b82f6',
          glow:    'rgba(96, 165, 250, 0.3)',
        },

        // Combat
        combat: {
          red:     '#dc2626',
          blood:   '#660011',
          dark:    '#3a0008',
          glow:    'rgba(220, 38, 38, 0.3)',
        },

        // Rarity colors (D&D inspired)
        rarity: {
          common:    '#9ca3af',
          uncommon:  '#22c55e',
          rare:      '#3b82f6',
          epic:      '#a855f7',
          legendary: '#f97316',
        },

        // Legacy aliases (backward compat during migration)
        grimoire: {
          primary:  '#12121a',
          darker:   '#0a0a0f',
          light:    '#1a1a2e',
        },
        parchment: {
          DEFAULT:  '#e8e0d0',
          dark:     '#a09882',
          light:    '#f0ead8',
        },
        ink: {
          DEFAULT:  '#2a2a40',
          light:    '#32324a',
          dark:     '#1a1a2e',
        },
        wisdom: {
          DEFAULT:  '#60a5fa',
          light:    '#93c5fd',
          dark:     '#3b82f6',
          glow:     'rgba(96, 165, 250, 0.3)',
        },
        danger: {
          DEFAULT:  '#ef4444',
          light:    '#f87171',
          dark:     '#dc2626',
          glow:     'rgba(239, 68, 68, 0.3)',
        },
        nature: {
          DEFAULT:  '#4ade80',
          light:    '#86efac',
          dark:     '#22c55e',
          glow:     'rgba(74, 222, 128, 0.3)',
        },
        arcane: {
          DEFAULT:  '#a855f7',
          light:    '#c084fc',
          dark:     '#9333ea',
          glow:     'rgba(168, 85, 247, 0.3)',
        },
        shadow: {
          soft:   'rgba(10, 10, 15, 0.7)',
          medium: 'rgba(10, 10, 15, 0.5)',
          light:  'rgba(10, 10, 15, 0.3)',
        },
        highlight: 'rgba(218, 165, 32, 0.1)',
      },

      fontFamily: {
        heading:  ['Cinzel', 'serif'],
        body:     ['Cormorant Garamond', 'serif'],
        ui:       ['Inter', 'system-ui', 'sans-serif'],
        accent:   ['Philosopher', 'sans-serif'],
        mono:     ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'hero':    ['3.5rem', { lineHeight: '1.1', letterSpacing: '0.04em' }],
        'display': ['2.5rem', { lineHeight: '1.2', letterSpacing: '0.02em' }],
        'title':   ['1.75rem', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.8' }],
      },

      borderRadius: {
        'panel': '0.75rem',
      },

      animation: {
        // Gold glow effects
        'glow-gold':      'glowGold 3s ease-in-out infinite',
        'glow-gold-slow': 'glowGold 5s ease-in-out infinite',
        'glow-red':       'glowRed 2s ease-in-out infinite',
        'glow-blue':      'glowBlue 3s ease-in-out infinite',
        'glow-purple':    'glowPurple 3.5s ease-in-out infinite',
        'glow-green':     'glowGreen 4s ease-in-out infinite',

        // Entrance animations
        'fade-in':        'fadeIn 0.5s ease-out',
        'fade-in-up':     'fadeInUp 0.6s ease-out',
        'fade-in-down':   'fadeInDown 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-in-left':  'slideInLeft 0.4s ease-out',
        'slide-up':       'slideUp 0.3s ease-out',
        'card-enter':     'cardEnter 0.4s ease-out',

        // Interactive effects
        'pulse-subtle':   'pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-gold':     'pulseGold 2s ease-in-out infinite',
        'shimmer':        'shimmer 2.5s linear infinite',
        'breathe':        'breathe 4s ease-in-out infinite',
        'float':          'float 6s ease-in-out infinite',

        // Scene & narrative
        'scene-reveal':   'sceneReveal 0.6s ease-out',
        'text-reveal':    'textReveal 0.8s ease-out',

        // Combat
        'damage-flash':   'damageFlash 0.3s ease-out',
        'damage-rise':    'damageRise 0.8s ease-out forwards',
        'hp-flash':       'hpFlash 0.5s ease-in-out infinite alternate',

        // Ambient
        'ember-rise':     'emberRise 4s ease-out infinite',
        'ember-rise-2':   'emberRise 6s ease-out 2s infinite',
        'ember-rise-3':   'emberRise 5s ease-out 1s infinite',

        // Spinner
        'spin-slow':      'spin 2s linear infinite',

        // Border gradient
        'border-flow':    'borderFlow 3s linear infinite',

        // Legacy aliases
        'glow-wisdom':    'glowBlue 3s ease-in-out infinite',
        'glow-danger':    'glowRed 2s ease-in-out infinite',
        'glow-nature':    'glowGreen 4s ease-in-out infinite',
        'glow-arcane':    'glowPurple 3.5s ease-in-out infinite',
      },

      keyframes: {
        // === GLOW EFFECTS ===
        glowGold: {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(218, 165, 32, 0.3), 0 0 30px rgba(218, 165, 32, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(218, 165, 32, 0.5), 0 0 50px rgba(218, 165, 32, 0.25)',
          },
        },
        glowRed: {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.3), 0 0 30px rgba(239, 68, 68, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(239, 68, 68, 0.5), 0 0 50px rgba(239, 68, 68, 0.25)',
          },
        },
        glowBlue: {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(96, 165, 250, 0.3), 0 0 30px rgba(96, 165, 250, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(96, 165, 250, 0.5), 0 0 50px rgba(96, 165, 250, 0.25)',
          },
        },
        glowPurple: {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(168, 85, 247, 0.3), 0 0 30px rgba(168, 85, 247, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(168, 85, 247, 0.5), 0 0 50px rgba(168, 85, 247, 0.25)',
          },
        },
        glowGreen: {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(74, 222, 128, 0.3), 0 0 30px rgba(74, 222, 128, 0.15)',
          },
          '50%': {
            boxShadow: '0 0 25px rgba(74, 222, 128, 0.5), 0 0 50px rgba(74, 222, 128, 0.25)',
          },
        },

        // === ENTRANCE ANIMATIONS ===
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%':   { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cardEnter: {
          '0%':   { opacity: '0', transform: 'translateY(15px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },

        // === INTERACTIVE ===
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.8' },
        },
        pulseGold: {
          '0%, 100%': { borderColor: 'rgba(218, 165, 32, 0.3)' },
          '50%':      { borderColor: 'rgba(218, 165, 32, 0.7)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.015)', opacity: '0.95' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },

        // === SCENE & NARRATIVE ===
        sceneReveal: {
          '0%':   { opacity: '0', transform: 'translateY(-10px)', maxHeight: '0' },
          '100%': { opacity: '1', transform: 'translateY(0)', maxHeight: '500px' },
        },
        textReveal: {
          '0%':   { opacity: '0', clipPath: 'inset(0 100% 0 0)' },
          '100%': { opacity: '1', clipPath: 'inset(0 0 0 0)' },
        },

        // === COMBAT ===
        damageFlash: {
          '0%':   { backgroundColor: 'rgba(220, 38, 38, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        damageRise: {
          '0%':   { opacity: '1', transform: 'translateY(0) scale(1)' },
          '70%':  { opacity: '1', transform: 'translateY(-30px) scale(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(-50px) scale(0.9)' },
        },
        hpFlash: {
          '0%':   { opacity: '1' },
          '100%': { opacity: '0.6' },
        },

        // === AMBIENT ===
        emberRise: {
          '0%':   { opacity: '0', transform: 'translateY(0) scale(0.5)' },
          '20%':  { opacity: '0.8' },
          '100%': { opacity: '0', transform: 'translateY(-100vh) scale(0)' },
        },

        // === BORDER GRADIENT ===
        borderFlow: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },

      boxShadow: {
        // Panel shadows
        'panel':       '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 1px rgba(218, 165, 32, 0.1)',
        'panel-hover': '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 2px rgba(218, 165, 32, 0.2)',
        'panel-lg':    '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 3px rgba(218, 165, 32, 0.15)',

        // Glow shadows
        'gold':    '0 0 20px rgba(218, 165, 32, 0.4), 0 4px 16px rgba(218, 165, 32, 0.2)',
        'blue':    '0 0 20px rgba(96, 165, 250, 0.4), 0 4px 16px rgba(96, 165, 250, 0.2)',
        'red':     '0 0 20px rgba(239, 68, 68, 0.4), 0 4px 16px rgba(239, 68, 68, 0.2)',
        'green':   '0 0 20px rgba(74, 222, 128, 0.4), 0 4px 16px rgba(74, 222, 128, 0.2)',
        'purple':  '0 0 20px rgba(168, 85, 247, 0.4), 0 4px 16px rgba(168, 85, 247, 0.2)',

        // Inner glow
        'inner-gold': 'inset 0 1px 12px rgba(218, 165, 32, 0.1)',
        'inner-glow': 'inset 0 1px 12px rgba(218, 165, 32, 0.08)',

        // Legacy aliases
        'grimoire':    '0 8px 30px rgba(0, 0, 0, 0.5), 0 0 2px rgba(218, 165, 32, 0.15)',
        'grimoire-lg': '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 3px rgba(218, 165, 32, 0.2)',
        'parchment':   '0 4px 16px rgba(0, 0, 0, 0.3)',
        'parchment-hover': '0 8px 24px rgba(0, 0, 0, 0.4)',
        'wisdom':      '0 0 20px rgba(96, 165, 250, 0.4), 0 4px 16px rgba(96, 165, 250, 0.2)',
        'danger':      '0 0 20px rgba(239, 68, 68, 0.4), 0 4px 16px rgba(239, 68, 68, 0.2)',
        'nature':      '0 0 20px rgba(74, 222, 128, 0.4), 0 4px 16px rgba(74, 222, 128, 0.2)',
        'arcane':      '0 0 20px rgba(168, 85, 247, 0.4), 0 4px 16px rgba(168, 85, 247, 0.2)',
      },

      backdropBlur: {
        xs: '2px',
      },

      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #8b6914, #daa520, #f0c850, #daa520, #8b6914)',
        'gold-line':     'linear-gradient(90deg, transparent, #daa520, transparent)',
        'dark-gradient':  'linear-gradient(180deg, #0a0a0f, #12121a, #1a1a2e)',
      },
    },
  },
  plugins: [],
};
