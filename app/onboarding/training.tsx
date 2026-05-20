import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

const PATTERNS = [
  { key: 'ppl',         label: 'Push / Pull / Legs',      sub: '3-day rotation, classic split' },
  { key: 'upper_lower', label: 'Upper / Lower',           sub: '4-day, alternating body halves' },
  { key: 'full_body',   label: 'Full body',               sub: 'Every session works everything' },
  { key: 'body_part',   label: 'Body-part split',         sub: 'Chest day, back day, leg day' },
  { key: 'program',     label: 'I follow a program',      sub: 'Stronglifts, 5/3/1, GZCL, etc' },
  { key: 'freestyle',   label: 'I mix it up freestyle',   sub: 'Whatever feels right that day' },
]

export default function TrainingScreen() {
  const { colors, spacing, radius } = useTheme()
  const { save } = useProfile()
  const router = useRouter()
  const [pattern, setPattern] = useState<string | null>(null)

  async function handleFinish() {
    if (!pattern) return
    await save({ trainingPattern: pattern, onboarded: true })
    router.replace('/(tabs)')
  }

  async function handleSkip() {
    await save({ trainingPattern: null, onboarded: true })
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
        <Text style={[styles.step, { color: colors.textMuted }]}>STEP 6 OF 6</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          How do you train?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          We'll match the equipment you need to the days you need it.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 8 }}>
          {PATTERNS.map(p => {
            const active = pattern === p.key
            return (
              <TouchableOpacity
                key={p.key}
                onPress={() => setPattern(p.key)}
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
                  marginBottom: 3,
                }}>
                  {p.label}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color:    active ? colors.accent : colors.textMuted,
                  opacity:  active ? 0.85 : 1,
                }}>
                  {p.sub}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.screen, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleFinish}
          disabled={!pattern}
          activeOpacity={0.85}
          style={{
            backgroundColor: pattern ? colors.accent : colors.surfaceRaised,
            paddingVertical: 16,
            borderRadius:    radius.card,
            alignItems:      'center',
          }}
        >
          <Text style={{
            fontSize:      15,
            fontWeight:    '800',
            letterSpacing: 0.5,
            color:         pattern ? colors.accentText : colors.textMuted,
          }}>
            START FINDING SPOTS
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:     { flex: 1 },
  header:   { paddingTop: 12, paddingBottom: 20 },
  step:     { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 },
  title:    { fontSize: 30, fontWeight: '800', letterSpacing: -1, marginBottom: 8, lineHeight: 34 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  footer:   { paddingTop: 12, paddingBottom: 12 },
})
