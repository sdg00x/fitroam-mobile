import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

export default function ProfileScreen() {
  const { colors, spacing, radius } = useTheme()
  const { profile, reset } = useProfile()
  const router = useRouter()

  async function handleReset() {
    await reset()
    router.replace('/onboarding/style')
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={{ padding: spacing.screen }}>
        <Text style={{
          fontSize:      28,
          fontWeight:    '800',
          color:         colors.textPrimary,
          marginBottom:  20,
        }}>
          Profile
        </Text>

        <View style={{
          padding:         spacing.card,
          borderRadius:    radius.card,
          backgroundColor: colors.surface,
          borderWidth:     1,
          borderColor:     colors.border,
          marginBottom:    16,
        }}>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8, fontWeight: '700', letterSpacing: 1 }}>
            CURRENT PROFILE
          </Text>
          <Text style={{ fontSize: 13, color: colors.textPrimary, marginBottom: 4 }}>
            Primary: {profile.primaryActivity}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textPrimary, marginBottom: 4 }}>
            Activities: {profile.activities.join(', ') || 'none'}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textPrimary, marginBottom: 4 }}>
            Lifestyle: {profile.lifestyle.join(', ') || 'none'}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textPrimary, marginBottom: 4 }}>
            Monthly: {profile.monthlyBudget} · Daily: {profile.travelDailyBudget}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textPrimary }}>
            Max distance: {profile.maxDistanceMinutes} min
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleReset}
          activeOpacity={0.85}
          style={{
            backgroundColor: colors.accent,
            paddingVertical: 14,
            borderRadius:    radius.card,
            alignItems:      'center',
          }}
        >
          <Text style={{
            fontSize:   14,
            fontWeight: '800',
            color:      colors.accentText,
            letterSpacing: 0.5,
          }}>
            RESTART ONBOARDING
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
})