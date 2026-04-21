import { useColorScheme } from 'react-native'
import { colors, spacing, radius } from './tokens'

export function useTheme() {
  const scheme = useColorScheme()
  const isDark  = scheme !== 'light'
  return {
    colors:  isDark ? colors.dark : colors.light,
    spacing,
    radius,
    isDark,
  }
}