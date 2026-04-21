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
    background:     '#ffffff',
    surface:        '#f8f8f8',
    surfaceRaised:  '#f0f0f0',
    surfaceFooter:  '#f0f0f0',
    heroBackground: '#ffffff',
    accent:         '#c8ff57',
    accentText:     '#0e0e0e',
    textPrimary:    '#1a1a1a',
    textSecondary:  '#666666',
    textMuted:      '#999999',
    border:         '#eeeeee',
    scoreBg:        '#1a1a1a',
    scoreText:      '#c8ff57',
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