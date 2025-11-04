
// Palette de couleurs principale
export const colors = {
    // Couleurs primaires (thème eau/pêche)
    primary: {
        50: '#E6F7FF',
        100: '#BAE7FF',
        200: '#91D5FF',
        300: '#69C0FF',
        400: '#40A9FF',
        500: '#1890FF', // Bleu principal
        600: '#096DD9',
        700: '#0050B3',
        800: '#003A8C',
        900: '#002766',
    },

    // Couleurs secondaires (vert nature)
    secondary: {
        50: '#F0F9FF',
        100: '#E0F2FE',
        200: '#BAE6FD',
        300: '#7DD3FC',
        400: '#38BDF8',
        500: '#0EA5E9',
        600: '#0284C7',
        700: '#0369A1',
        800: '#075985',
        900: '#0C4A6E',
    },

    // Accent (poisson doré/trophée)
    accent: {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
        600: '#D97706',
        700: '#B45309',
        800: '#92400E',
        900: '#78350F',
    },

    // Grays
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },

    // États
    success: {
        light: '#D1FAE5',
        main: '#10B981',
        dark: '#059669',
    },
    warning: {
        light: '#FEF3C7',
        main: '#F59E0B',
        dark: '#D97706',
    },
    error: {
        light: '#FEE2E2',
        main: '#EF4444',
        dark: '#DC2626',
    },
    info: {
        light: '#DBEAFE',
        main: '#3B82F6',
        dark: '#2563EB',
    },

    // Couleurs de base
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',

    // Background
    background: {
        default: '#FFFFFF',
        paper: '#F9FAFB',
        elevated: '#FFFFFF',
    },

    // Text
    text: {
        primary: '#111827',
        secondary: '#6B7280',
        disabled: '#9CA3AF',
        inverse: '#FFFFFF',
    },

    // Borders
    border: {
        light: '#E5E7EB',
        main: '#D1D5DB',
        dark: '#9CA3AF',
    },
};

// Typography
export const typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
        // Si vous voulez des custom fonts :
        // regular: 'Inter-Regular',
        // medium: 'Inter-Medium',
        // bold: 'Inter-Bold',
    },

    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
        '6xl': 60,
    },

    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
    },
};

// Spacing system (base 4px)
export const spacing = {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
};

// Border radius
export const borderRadius = {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

// Shadows
export const shadows = {
    none: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    base: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    md: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    lg: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    xl: {
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 12,
    },
};

// Icônes (tailles standards)
export const iconSizes = {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 32,
    xl: 40,
    '2xl': 48,
};

// Layout
export const layout = {
    containerPadding: spacing[4],
    screenPadding: spacing[4],
    cardPadding: spacing[4],
    sectionSpacing: spacing[6],
};

// Animation timing
export const animation = {
    fast: 150,
    base: 250,
    slow: 350,
};

// Export tout ensemble
export const theme = {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    iconSizes,
    layout,
    animation,
};

export type Theme = typeof theme;