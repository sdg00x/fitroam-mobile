import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

const PRIORITIES = [
  { key: '24hr',           label: '24-hour access' },
  { key: 'beginner',       label: 'Beginner friendly' },
  { key: 'serious',        label: 'Serious lifters only' },
  { key: 'cleanliness',    label: 'Cleanliness' },
  { key: 'deadlift',       label: 'Deadlift platform' },
  { key: 'quiet',          label: 'Quiet at peak times' },
  { key: 'equipment',      label: 'Equipment variety' },
  { key: 'community',      label: 'Strong community' },
  { key: 'pool',           label: 'Pool' },
  { key: 'amenities',      label: 'Showers & amenities' },
]

const DISTANCES = [
  { key: 5,  label: 'Walking distance' },
  { key: 15, label: 'Short distance' },
  { key: 60, label: "I'll travel for it" },
]

export default function PrioritiesScreen() {
  const { colors, spacing, radius } = useTheme()
  const { save } = useProfile()
  const router = useRouter()
  const [priorities, setPriorities] = useState<string[]>([])
  const [distance,   setDistance]   = useState<number | null>(null)

  function togglePriority(key: string) {
    setPriorities(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleFinish() {
    if (distance === null) return
    await save({
      priorities,
      maxDistanceMinutes: distance,
      onboarded:          true,
    })
    router.replace('/(tabs)')
  }

  async function handleSkip() {
    await save({
      priorities:         [],
      maxDistanceMinutes: 15,
      onboarded:          true,
    })
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>

      {/* Top nav with back + skip */}
      <View style={{
        flexDirection:     'row',
        justifyContent:    'space-between',
        paddingHorizontal: spacing.screen,
        paddingTop:        12,
        paddingBottom:     4,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: colors.surface,
            borderWidth: 1, borderColor: colors.border,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          activeOpacity={0.7}
          style={{
            paddingVertical:   8,
            paddingHorizontal: 14,
            borderRadius:      100,
            backgroundColor:   colors.surface,
            borderWidth:       1,
            borderColor:       colors.border,
          }}
        >
          <Text style={{
            fontSize:      12,
            fontWeight:    '700',
            color:         colors.textSecondary,
            letterSpacing: 0.3,
          }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <Text style={[styles.step, { color: colors.textMuted }]}>STEP 5 OF 5</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          What matters most?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          We'll prioritise places with what you care about.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          WHAT MAKES A PLACE GOOD
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {PRIORITIES.map(p => {
            const active = priorities.includes(p.key)
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => togglePriority(p.key)}
                activeOpacity={0.8}
                style={{
                  paddingVertical:   12,
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
                  {p.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          HOW FAR WILL YOU TRAVEL?
        </Text>
        <View style={{ gap: 8 }}>
          {DISTANCES.map(d => {
            const active = distance === d.key
            return (
              <TouchableOpacity
                key={d.key}
                onPress={() => setDistance(d.key)}
                activeOpacity={0.8}
                style={{
                  padding:         spacing.card,
                  borderRadius:    radius.card,
                  borderWidth:     1,
                  borderColor:     active ? colors.accent : colors.border,
                  backgroundColor: active ? 'rgba(200, 255, 87, 0.08)' : colors.surface,
                }}
              >
                <Text style={{
                  fontSize:   15,
                  fontWeight: '700',
                  color:      active ? colors.accent : colors.textPrimary,
                }}>
                  {d.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.screen, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleFinish}
          disabled={distance === null}
          activeOpacity={0.85}
          style={{
            backgroundColor: distance !== null ? colors.accent : colors.surfaceRaised,
            paddingVertical: 16,
            borderRadius:    radius.card,
            alignItems:      'center',
          }}
        >
          <Text style={{
            fontSize:   15,
            fontWeight: '800',
            letterSpacing: 0.5,
            color:      distance !== null ? colors.accentText : colors.textMuted,
          }}>
            START FINDING SPOTS
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:         { flex: 1 },
  header:       { paddingTop: 12, paddingBottom: 20 },
  step:         { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  title:        { fontSize: 30, fontWeight: '800', letterSpacing: -1, marginBottom: 8, lineHeight: 34 },
  subtitle:     { fontSize: 14, lineHeight: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12 },
  footer:       { paddingTop: 12, paddingBottom: 12 },
})