import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/theme/useTheme'

export default function TripsScreen() {
  const { colors, spacing } = useTheme()

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: spacing.screen, paddingTop: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{
            fontSize:      32,
            fontWeight:    '800',
            color:         colors.textPrimary,
            letterSpacing: -1,
          }}>
            My trips
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              backgroundColor:   colors.accent,
              paddingHorizontal: 14,
              paddingVertical:   8,
              borderRadius:      100,
            }}
          >
            <Text style={{
              fontSize:   11,
              fontWeight: '800',
              color:      colors.accentText,
              letterSpacing: 0.5,
            }}>
              + ADD TRIP
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Empty state */}
      <View style={styles.empty}>
        <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
          No trips planned yet
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 32 }}>
          Plan your training across cities. Multi-leg trips, saved gyms per city, smart pricing across the whole journey.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:  { flex: 1 },
  empty: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingBottom:  80,
  },
})
