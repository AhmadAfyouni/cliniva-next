export const colors = {
  light: {
    // Background colors
    background: {
      primary: "#fafaf8",
      secondary: "#ffffff",
      tertiary: "#f6f6f7",
    },

    // Text colors
    text: {
      primary: "#2a2b2a",
      secondary: "#717680",
      muted: "#717680",
    },

    // Brand colors
    brand: {
      primary: "#00b48d", // Main green
      primaryHover: "#00a080", // Darker green for hover
      secondary: "#69a3e9", // Blue accent
    },

    // Border colors
    border: {
      primary: "#e4e2dd",
      secondary: "#c4c4c4",
    },

    // State colors
    state: {
      active: "#00b48d",
      inactive: "#c4c4c4",
      error: "#ef4444",
      success: "#22c55e",
      warning: "#f59e0b",
    },
  },

  // Dark mode colors will be added later
  dark: {
    // Placeholder for future dark mode implementation
  },
} as const

// Type for color access
export type ColorTheme = typeof colors.light

// Cliniva color palette for showcase component
export const clinivaColors = {
  primary: {
    DEFAULT: "#69a3e9",
    light: "#8bb8ed",
    dark: "#4a8dd8",
  },
  secondary: {
    DEFAULT: "#00b48d",
    light: "#00d4a5",
    dark: "#009975",
  },
  success: {
    DEFAULT: "#22c55e",
    light: "#4ade80",
    dark: "#16a34a",
  },
  error: {
    DEFAULT: "#ef4444",
    light: "#f87171",
    dark: "#dc2626",
  },
  warning: {
    DEFAULT: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
  },
  info: {
    DEFAULT: "#3b82f6",
    light: "#60a5fa",
    dark: "#2563eb",
  },
  neutral: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
  },
} as const

// Predefined Tailwind classes for common patterns
export const clinivaClasses = {
  button: {
    primary: "bg-primary text-primary-foreground hover:bg-cliniva-primary-dark",
    secondary: "bg-secondary text-secondary-foreground hover:bg-cliniva-secondary-dark",
    outline: "border border-primary text-primary hover:bg-primary hover:text-white",
    ghost: "text-primary hover:bg-primary/10",
  },
  text: {
    brand: "text-cliniva-primary",
    success: "text-cliniva-success",
    error: "text-destructive",
    warning: "text-cliniva-warning",
    info: "text-cliniva-info",
  },
  badge: {
    success: "bg-cliniva-success text-white",
    error: "bg-destructive text-white",
    warning: "bg-cliniva-warning text-white",
    info: "bg-cliniva-info text-white",
  },
} as const