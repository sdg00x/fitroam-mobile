import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

const PATTERN_LABELS: Record<string, string> = {
  ppl:         'Push / Pull / Legs',
  upper_lower: 'Upper / Lower',
  full_body:   'Full body',
  body_part:   'Body-part split',
  program:     'Following a program',
  freestyle:   'Freestyle',
}

export default function ProfileScreen() {
  const { colors, spacing, radius } = useTheme()
  const { profile, reset } = useProfile()
  const router = useRouter()

  function confirmReset() {
    Alert.alert(
      'Restart onboarding?',
      'This clears all your preferences and starts fresh. To just adjust them, use Edit profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Restart', style: 'destructive', onPress: doReset },
      ]
    )
  }

  async function doReset() {
    await reset()
    router.replace('/onboarding/style')
  }

  const trainingPatternLabel = profile.trainingPattern
    ? PATTERN_LABELS[profile.trainingPattern] || profile.trainingPattern
    : 'Not set'

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{
          fontSize:      32,
          fontWeight:    '800',
          color:         colors.textPrimary,
          letterSpacing: -1,
          marginTop:     20,
          marginBottom:  20,
        }}>
          Profile
        </Text>

        {/* Edit profile CTA */}
        <TouchableOpacity
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.85}
          style={{
            backgroundColor:   colors.accent,
            paddingVertical:   14,
            paddingHorizontal: 16,
            borderRadius:      radius.card,
            flexDirection:     'row',
            alignItems:        'center',
            justifyContent:    'space-between',
            marginBottom:      24,
          }}
        >
          <View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.accentText }}>
              Edit profile
            </Text>
            <Text style={{ fontSize: 11, color: colors.accentText, opacity: 0.7, marginTop: 2 }}>
              Adjust your preferences without restarting
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.accentText} />
        </TouchableOpacity>

        {/* Read-only summary */}
        <View style={{
          padding:         spacing.card,
          borderRadius:    radius.card,
          backgroundColor: colors.surface,
          borderWidth:     1,
          borderColor:     colors.border,
          marginBottom:    16,
        }}>
          <Text style={{
            fontSize:      11,
            color:         colors.textMuted,
            marginBottom:  10,
            fontWeight:    '700',
            letterSpacing: 1,
          }}>
            CURRENT PROFILE
          </Text>
          <ProfileRow colors={colors} label="Primary"        value={profile.primaryActivity} />
          <ProfileRow colors={colors} label="Activities"     value={profile.activities.join(', ') || 'none'} />
          <ProfileRow colors={colors} label="Lifestyle"      value={profile.lifestyle.join(', ') || 'none'} />
          <ProfileRow colors={colors} label="Training"       value={trainingPatternLabel} />
          <ProfileRow colors={colors} label="Monthly budget" value={profile.monthlyBudget} />
          <ProfileRow colors={colors} label="Travel budget"  value={profile.travelDailyBudget} />
          <ProfileRow colors={colors} label="Max distance"   value={`${profile.maxDistanceMinutes} min`} last />
        </View>

        {/* Restart onboarding — destructive secondary */}
        <TouchableOpacity
          onPress={confirmReset}
          activeOpacity={0.7}
          style={{
            paddingVertical: 14,
            borderRadius:    radius.card,
            alignItems:      'center',
            borderWidth:     1,
            borderColor:     colors.border,
          }}
        >
          <Text style={{
            fontSize:      13,
            fontWeight:    '700',
            color:         colors.textMuted,
            letterSpacing: 0.5,
          }}>
            Restart onboarding
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function ProfileRow({ colors, label, value, last }: { colors: any; label: string; value: string; last?: boolean }) {
  return (
    <View style={{
      flexDirection:  'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: colors.border,
    }}>
      <Text style={{ fontSize: 12, color: colors.textMuted, fontWeight: '600' }}>
        {label}
      </Text>
      <Text style={{ fontSize: 12, color: colors.textPrimary, fontWeight: '700', flex: 1, textAlign: 'right' }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
})
