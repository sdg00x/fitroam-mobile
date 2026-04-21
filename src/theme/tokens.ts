export const colors = {
  dark: {
    background:     '#0e0e0e',
    surface:        '#161616',
    surfaceRaised:  '#1a1a1a',
    surfaceFooter:  '#111111',
    heroBackground: '#0e0e0e',
    accent:         '#c8ff57',
    accentText:     '#0e0e0e',
    textPrimary:    '#ffffff',
    textSecondary:  '#666666',
    textMuted:      '#444444',
    border:         '#252525',
    scoreBg:        '#c8ff57',
    scoreText:      '#0e0e0e',
    error:          '#f87171',
  },
  light: {
    background:     '#faf7f2',
    surface:        '#ffffff',
    surfaceRaised:  '#f5f0e8',
    surfaceFooter:  '#f0ebe0',
    heroBackground: '#2b4a39',
    accent:         '#2b4a39',
    accentText:     '#ffffff',
    textPrimary:    '#1a1410',
    textSecondary:  '#9a8f82',
    textMuted:      '#b8ae9f',
    border:         '#e8e0d4',
    scoreBg:        '#2b4a39',
    scoreText:      '#ffffff',
    error:          '#dc2626',
  },
} as const

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
  screen: 18,
  card:   12,
} as const

export const radius = {
  tag:  6,
  btn:  7,
  row:  10,
  card: 14,
  pill: 100,
} as const