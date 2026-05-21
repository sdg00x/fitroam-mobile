import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '../theme/useTheme'

export function ChipGrid({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {children}
    </View>
  )
}

export function Chip({
  label, sub, active, onPress,
}: { label: string; sub?: string; active: boolean; onPress: () => void }) {
  const { colors } = useTheme()
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingVertical:   sub ? 12 : 10,
        paddingHorizontal: 16,
        borderRadius:      100,
        borderWidth:       1,
        borderColor:       active ? colors.accent : colors.border,
        backgroundColor:   active ? 'rgba(200, 255, 87, 0.08)' : colors.surface,
      }}
    >
      <Text style={{
        fontSize:   13,
        fontWeight: '700',
        color:      active ? colors.accent : colors.textPrimary,
      }}>
        {label}
      </Text>
      {sub && (
        <Text style={{
          fontSize:  11,
          color:     active ? colors.accent : colors.textMuted,
          opacity:   active ? 0.85 : 1,
          marginTop: 2,
        }}>
          {sub}
        </Text>
      )}
    </TouchableOpacity>
  )
}
