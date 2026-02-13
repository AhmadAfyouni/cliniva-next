// Cliniva SYS Design System - Theme-Aware Version

export const designSystem = {
  // Theme Configuration
  themes: {
    light: {
      // Primary Colors
      primary: {
        light: '#E1EDFB',
        default: '#69A3E9',
        dark: '#3071BF',
      },
      
      // Secondary Colors
      secondary: {
        light: '#E2F6EC',
        default: '#83DFDF',
        dark: '#00B48D',
      },
      
      // Background Colors
      background: {
        primary: '#FFFDFC',    // surface-default
        secondary: '#FAFAF8',  // bg-subtle
        tertiary: '#FAF6F5',   // bg
        inverse: '#080101',    // Dark mode primary
        overlay: 'rgba(0, 0, 0, 0.5)',
        card: '#FFFDFC',
        modal: '#FFFDFC',
        popover: '#FAFAF8',
      },
      
      // Text Colors (on-surface) - Improved contrast
      text: {
        primary: '#414651',    // on-surface-primary - good contrast on light bg
        secondary: '#717680',  // on-surface-secondary - medium contrast
        tertiary: '#8B8B8B',  // Darker tertiary for better readability
        inverse: '#FCFDFF',    // White text for dark backgrounds
        muted: '#9CA3AF',     // Muted but still readable
        accent: '#2563EB',    // Darker blue for better contrast
      },
      
      // Border Colors
      border: {
        light: '#E4E2DD',      // border-default
        medium: '#B8B1A9',     // on-surface-tertiary
        dark: '#717680',       // on-surface-secondary
        focus: '#69A3E9',      // Primary default
      },
      
      // Surface Colors (for cards, inputs, etc.)
      surface: {
        primary: '#FFFDFC',    // surface-default
        secondary: '#FAFAF8',  // bg-subtle
        tertiary: '#FAF6F5',   // bg
        hover: '#F5F3F0',      // Slightly darker than bg
        active: '#F0EDE8',     // Even darker for active states
      },
    },
    
    dark: {
      // Primary Colors (updated with new dark mode palette)
      primary: {
        light: '#08101A',
        default: '#295283',
        dark: '#3A6B9C',
      },
      
      // Secondary Colors (updated with new dark mode palette)
      secondary: {
        light: '#0C1A13',
        default: '#2E6F6F',
        dark: '#66E4C9',
      },
      
      // Background Colors (updated with new dark mode palette)
      background: {
        primary: '#030000',    // surface-default
        secondary: '#080806',  // bg-subtle
        tertiary: '#0A0707',   // bg
        inverse: '#FFFDFC',    // Light mode primary
        overlay: 'rgba(0, 0, 0, 0.8)',
        card: '#161616',       // Updated card background
        modal: '#161616',      // Updated modal background
        popover: '#161616',    // Updated popover background
      },
      
      // Text Colors (on-surface) - Updated with new colors
      text: {
        primary: '#3d78bd',    // Updated primary text color (blue)
        secondary: '#2b9999',  // Updated secondary text color (teal)
        tertiary: '#9CA3AF',   // Medium gray for tertiary text
        inverse: '#030000',    // Dark background color for light text
        muted: '#6B7280',     // Muted but still readable on dark
        accent: '#66E4C9',    // Secondary dark for accent text
      },
      
      // Border Colors (updated with new dark mode palette)
      border: {
        light: '#21201C',      // border-default
        medium: '#55514A',     // on-surface-tertiary
        dark: '#81858C',       // on-surface-secondary
        focus: '#66E4C9',      // Secondary dark for visibility
      },
      
      // Surface Colors (updated with new dark mode palette)
      surface: {
        primary: '#161616',    // Updated to match card background
        secondary: '#1A1A1A',  // Slightly lighter for variety
        tertiary: '#0A0707',   // bg
        hover: '#202020',      // Hover state for cards
        active: '#2A2A2A',     // Active state for cards
      },
    },
  },

  // Color Palette (static colors that don't change with theme)
  colors: {
    // Primary Colors (using new palette)
    primary: {
      50: '#E1EDFB',
      100: '#A5C8F2',
      200: '#69A3E9',
      300: '#4A8DE0',
      400: '#3071BF',
      500: '#275C9B', // Main primary (dark mode)
      600: '#1E4A7E',
      700: '#153458',
      800: '#0F2742',
      900: '#0A1A2C',
      950: '#05101A',
    },
    
    // Secondary Colors (using new palette)
    secondary: {
      50: '#E2F6EC',
      100: '#C8ECDB',
      200: '#9BD9C7',
      300: '#83DFDF',
      400: '#5BC5B8',
      500: '#00B48D', // Main secondary (light mode)
      600: '#3CA8A8', // Dark mode secondary
      700: '#24583E',
      800: '#0B614E',
      900: '#084A3D',
      950: '#05332A',
    },
    
    // Neutral Colors (using new surface colors)
    neutral: {
      50: '#FFFDFC',   // Light surface-default
      100: '#FAFAF8',  // Light bg-subtle
      200: '#FAF6F5',  // Light bg
      300: '#E4E2DD',  // Light border-default
      400: '#B8B1A9',  // Light on-surface-tertiary
      500: '#717680',  // Light on-surface-secondary
      600: '#414651',  // Light on-surface-primary
      700: '#282A30',  // Dark on-surface-primary
      800: '#211714',  // Dark bg
      900: '#181813',  // Dark bg-subtle
      950: '#080101',  // Dark surface-default
    },
    
    // Semantic Colors (keeping original structure)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },

  
  // Typography (completely updated with new specifications)
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      serif: ['Merriweather', 'Georgia', 'serif'],
      mono: ['Fira Code', 'Consolas', 'monospace'],
    },
    
    // Heading styles
    heading: {
      h1: {
        semibold: { fontSize: '2rem', fontWeight: 600, lineHeight: '2.5rem' },    // 32px
        bold: { fontSize: '2rem', fontWeight: 700, lineHeight: '2.5rem' },
      },
      h2: {
        bold: { fontSize: '1.75rem', fontWeight: 700, lineHeight: '2.25rem' },   // 28px
      },
      h3: {
        bold: { fontSize: '1.625rem', fontWeight: 700, lineHeight: '2rem' },     // 26px
      },
      h4: {
        bold: { fontSize: '1.5rem', fontWeight: 700, lineHeight: '2rem' },       // 24px
        extrabold: { fontSize: '1.5rem', fontWeight: 800, lineHeight: '2rem' },
      },
      h5: {
        bold: { fontSize: '1.375rem', fontWeight: 700, lineHeight: '1.75rem' },  // 22px
        extrabold: { fontSize: '1.375rem', fontWeight: 800, lineHeight: '1.75rem' },
      },
      h6: {
        bold: { fontSize: '1.25rem', fontWeight: 700, lineHeight: '1.75rem' },   // 20px
        extrabold: { fontSize: '1.25rem', fontWeight: 800, lineHeight: '1.75rem' },
      },
    },
    
    // Title styles
    title: {
      '18': {
        semibold: { fontSize: '1.125rem', fontWeight: 600, lineHeight: '1.5rem' }, // 18px
        bold: { fontSize: '1.125rem', fontWeight: 700, lineHeight: '1.5rem' },
      },
      '16': {
        regular: { fontSize: '1rem', fontWeight: 400, lineHeight: '1.5rem' },     // 16px
        semibold: { fontSize: '1rem', fontWeight: 600, lineHeight: '1.5rem' },
        bold: { fontSize: '1rem', fontWeight: 700, lineHeight: '1.5rem' },
      },
      '14': {
        regular: { fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.25rem' }, // 14px
        semibold: { fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.25rem' },
        bold: { fontSize: '0.875rem', fontWeight: 700, lineHeight: '1.25rem' },
      },
      '12': {
        regular: { fontSize: '0.75rem', fontWeight: 400, lineHeight: '1rem' },     // 12px
        semibold: { fontSize: '0.75rem', fontWeight: 600, lineHeight: '1rem' },
        bold: { fontSize: '0.75rem', fontWeight: 700, lineHeight: '1rem' },
      },
      '11': {
        regular: { fontSize: '0.6875rem', fontWeight: 400, lineHeight: '1rem' },   // 11px
        semibold: { fontSize: '0.6875rem', fontWeight: 600, lineHeight: '1rem' },
        bold: { fontSize: '0.6875rem', fontWeight: 700, lineHeight: '1rem' },
      },
      '10': {
        regular: { fontSize: '0.625rem', fontWeight: 400, lineHeight: '0.875rem' }, // 10px
        semibold: { fontSize: '0.625rem', fontWeight: 600, lineHeight: '0.875rem' },
        bold: { fontSize: '0.625rem', fontWeight: 700, lineHeight: '0.875rem' },
      },
      '9': {
        regular: { fontSize: '0.5625rem', fontWeight: 400, lineHeight: '0.75rem' }, // 9px
      },
      '8': {
        regular: { fontSize: '0.5rem', fontWeight: 400, lineHeight: '0.75rem' },    // 8px
      },
    },
    
    // Button styles
    button: {
      '14': {
        medium: { fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.25rem' },  // 14px
        semibold: { fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.25rem' },
      },
      '12': {
        medium: { fontSize: '0.75rem', fontWeight: 500, lineHeight: '1rem' },      // 12px
        semibold: { fontSize: '0.75rem', fontWeight: 600, lineHeight: '1rem' },
      },
      '11': {
        medium: { fontSize: '0.6875rem', fontWeight: 500, lineHeight: '1rem' },    // 11px
        semibold: { fontSize: '0.6875rem', fontWeight: 600, lineHeight: '1rem' },
      },
    },
    
    // Paragraph styles
    paragraph: {
      '16': {
        regular: { fontSize: '1rem', fontWeight: 400, lineHeight: '1.5rem' },      // 16px
        semibold: { fontSize: '1rem', fontWeight: 600, lineHeight: '1.5rem' },
        bold: { fontSize: '1rem', fontWeight: 700, lineHeight: '1.5rem' },
      },
      '14': {
        regular: { fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.25rem' }, // 14px
        semibold: { fontSize: '0.875rem', fontWeight: 600, lineHeight: '1.25rem' },
        bold: { fontSize: '0.875rem', fontWeight: 700, lineHeight: '1.25rem' },
      },
      '12': {
        regular: { fontSize: '0.75rem', fontWeight: 400, lineHeight: '1rem' },     // 12px
        semibold: { fontSize: '0.75rem', fontWeight: 600, lineHeight: '1rem' },
        bold: { fontSize: '0.75rem', fontWeight: 700, lineHeight: '1rem' },
      },
      '11': {
        regular: { fontSize: '0.6875rem', fontWeight: 400, lineHeight: '1rem' },   // 11px
        semibold: { fontSize: '0.6875rem', fontWeight: 600, lineHeight: '1rem' },
        bold: { fontSize: '0.6875rem', fontWeight: 700, lineHeight: '1rem' },
      },
      '10': {
        regular: { fontSize: '0.625rem', fontWeight: 400, lineHeight: '0.875rem' }, // 10px
        semibold: { fontSize: '0.625rem', fontWeight: 600, lineHeight: '0.875rem' },
        bold: { fontSize: '0.625rem', fontWeight: 700, lineHeight: '0.875rem' },
      },
    },
    
    // Legacy fontSize for backward compatibility
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      '5xl': ['3rem', { lineHeight: '1' }],           // 48px
      '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
      '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
    },
    
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Spacing Scale (keeping original)
  spacing: {
    px: '1px',
    0: '0px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },
  
  // Border Radius (keeping original)
  borderRadius: {
    none: '0px',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },
  
  // Shadows (keeping original)
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },
  
  // Z-Index Scale (keeping original)
  zIndex: {
    auto: 'auto',
    0: 0,
    10: 10,
    20: 20,
    30: 30,
    40: 40,
    50: 50,
    modal: 1000,
    popover: 1010,
    tooltip: 1020,
    overlay: 1030,
    max: 2147483647,
  },
  
  // Breakpoints (keeping original)
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  // Animation & Transitions (keeping original)
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    
    easing: {
      linear: 'cubic-bezier(0, 0, 1, 1)',
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  // Component Specific Values (keeping original)
  components: {
    button: {
      height: {
        sm: '2rem',     // 32px
        md: '2.5rem',   // 40px
        lg: '3rem',     // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',
        md: '0.625rem 1rem',
        lg: '0.75rem 1.5rem',
      },
    },
    
    input: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      padding: {
        sm: '0.375rem 0.75rem',
        md: '0.5rem 0.875rem',
        lg: '0.75rem 1rem',
      },
    },
    
    card: {
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
    },
    
    container: {
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1400px',
      },
      padding: {
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
      },
    },
  },
} as const;

// Theme utilities
export type Theme = 'light' | 'dark';
export type ThemeColors = typeof designSystem.themes[Theme];

// Get theme-specific colors
export const getThemeColor = (theme: Theme, path: string) => {
  const pathArray = path.split('.');
  let value: any = designSystem.themes[theme];
  
  for (const key of pathArray) {
    value = value?.[key];
  }
  
  return value;
};

// Typography utility functions
export const getTypographyStyle = (category: 'heading' | 'title' | 'button' | 'paragraph', size: string, weight: string = 'regular') => {
  const typographyCategory = designSystem.typography[category];
  // @ts-ignore - Dynamic access
  return typographyCategory?.[size]?.[weight];
};

// Theme context for React
export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colors: any; // Simplified to avoid type conflicts
}

// CSS variables for theme switching (adapted for Tailwind CSS v4)
export const generateThemeCSS = (theme: Theme): string => {
  const themeColors = designSystem.themes[theme];
  
  // Fallback if theme doesn't exist
  if (!themeColors) {
    console.warn(`Theme "${theme}" not found, falling back to light theme`);
    return generateThemeCSS('light');
  }
  
  let cssVars = `[data-theme="${theme}"] {\n`;
  
  // Generate CSS custom properties for theme colors
  const addVars = (obj: any, prefix: string) => {
    // Add null check to prevent runtime errors
    if (!obj || typeof obj !== 'object') {
      return;
    }
    
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        addVars(value, `${prefix}-${key}`);
      } else {
        cssVars += `  --${prefix}-${key}: ${value};\n`;
      }
    });
  };
  
  addVars(themeColors, 'theme');
  cssVars += '}\n';
  
  return cssVars;
};

// Type definitions for better TypeScript support
export type ColorScale = keyof typeof designSystem.colors.primary;
export type ColorName = keyof typeof designSystem.colors;
export type FontSize = keyof typeof designSystem.typography.fontSize;
export type FontWeight = keyof typeof designSystem.typography.fontWeight;
export type Spacing = keyof typeof designSystem.spacing;
export type BorderRadius = keyof typeof designSystem.borderRadius;
export type BoxShadow = keyof typeof designSystem.boxShadow;
export type ZIndex = keyof typeof designSystem.zIndex;
export type Breakpoint = keyof typeof designSystem.breakpoints;

// Typography types
export type TypographyCategory = 'heading' | 'title' | 'button' | 'paragraph';
export type HeadingSize = keyof typeof designSystem.typography.heading;
export type TitleSize = keyof typeof designSystem.typography.title;
export type ButtonSize = keyof typeof designSystem.typography.button;
export type ParagraphSize = keyof typeof designSystem.typography.paragraph;

// Utility functions for accessing design tokens
export const getColor = (color: string, scale?: ColorScale) => {
  const colorParts = color.split('.');
  let colorValue: any = designSystem.colors;
  
  colorParts.forEach(part => {
    colorValue = colorValue?.[part];
  });
  
  if (scale && colorValue && typeof colorValue === 'object') {
    return colorValue[scale];
  }
  
  return colorValue;
};

export const getSpacing = (space: Spacing) => {
  return designSystem.spacing[space];
};

export const getFontSize = (size: FontSize) => {
  return designSystem.typography.fontSize[size];
};

export const getBreakpoint = (bp: Breakpoint) => {
  return designSystem.breakpoints[bp];
};

// Tailwind Config Helper with Dark Mode Support
export const tailwindConfig = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Static colors (updated with new palette)
        ...designSystem.colors,
        
        // Theme-aware colors using CSS variables
        background: {
          primary: 'var(--theme-background-primary)',
          secondary: 'var(--theme-background-secondary)',
          tertiary: 'var(--theme-background-tertiary)',
          inverse: 'var(--theme-background-inverse)',
          overlay: 'var(--theme-background-overlay)',
          card: 'var(--theme-background-card)',
          modal: 'var(--theme-background-modal)',
          popover: 'var(--theme-background-popover)',
        },
        text: {
          primary: 'var(--theme-text-primary)',
          secondary: 'var(--theme-text-secondary)',
          tertiary: 'var(--theme-text-tertiary)',
          inverse: 'var(--theme-text-inverse)',
          muted: 'var(--theme-text-muted)',
          accent: 'var(--theme-text-accent)',
        },
        border: {
          light: 'var(--theme-border-light)',
          medium: 'var(--theme-border-medium)',
          dark: 'var(--theme-border-dark)',
          focus: 'var(--theme-border-focus)',
        },
        surface: {
          primary: 'var(--theme-surface-primary)',
          secondary: 'var(--theme-surface-secondary)',
          tertiary: 'var(--theme-surface-tertiary)',
          hover: 'var(--theme-surface-hover)',
          active: 'var(--theme-surface-active)',
        },
      },
      fontFamily: designSystem.typography.fontFamily,
      fontSize: designSystem.typography.fontSize,
      fontWeight: designSystem.typography.fontWeight,
      letterSpacing: designSystem.typography.letterSpacing,
      spacing: designSystem.spacing,
      borderRadius: designSystem.borderRadius,
      boxShadow: designSystem.boxShadow,
      zIndex: designSystem.zIndex,
      screens: designSystem.breakpoints,
    },
  },
};

export default designSystem;