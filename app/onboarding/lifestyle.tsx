import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

const LIFESTYLES = [
  { key: 'settled',         label: 'Settled in one place',     desc: 'I have a home base I train from' },
  { key: 'frequent_travel', label: 'I travel often',           desc: 'Work or leisure trips regularly' },
  { key: 'nomad',           label: "I'm a digital nomad",      desc: 'Living and working from new cities frequently' },
  { key: 'between_cities',  label: 'Just moved or between cities', desc: 'In transition right now' },
  { key: 'planning_trip',   label: 'Planning a specific trip', desc: 'Something coming up soon' },
]

export default function LifestyleScreen() {
  const { colors, spacing, radius } = useTheme()
  const { save } = useProfile()
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  function toggle(key: string) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleNext() {
    if (selected.length === 0) return
    await save({ lifestyle: selected })
    router.push('/onboarding/budget')
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>

      <View style={{
        flexDirection:     'row',
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
      </View>

      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <Text style={[styles.step, { color: colors.textMuted }]}>STEP 3 OF 5</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          How do you live?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Pick everything that fits.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {LIFESTYLES.map(l => {
          const active = selected.includes(l.key)
          return (
            <TouchableOpacity
              key={l.key}
              onPress={() => toggle(l.key)}
              activeOpacity={0.8}
              style={{
                padding:         spacing.card,
                borderRadius:    radius.card,
                borderWidth:     1,
                borderColor:     active ? colors.accent : colors.border,
                backgroundColor: active ? 'rgba(200, 255, 87, 0.08)' : colors.surface,
                marginBottom:    8,
                flexDirection:   'row',
                alignItems:      'center',
                gap:             14,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize:   16,
                  fontWeight: '700',
                  color:      active ? colors.accent : colors.textPrimary,
                  marginBottom: 3,
                }}>
                  {l.label}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>
                  {l.desc}
                </Text>
              </View>
              {active && (
                <Ionicons name="checkmark-circle" size={24} color={colors.accent} />
              )}
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.screen, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={selected.length === 0}
          activeOpacity={0.85}
          style={{
            backgroundColor: selected.length > 0 ? colors.accent : colors.surfaceRaised,
            paddingVertical: 16,
            borderRadius:    radius.card,
            alignItems:      'center',
          }}
        >
          <Text style={{
            fontSize:   15,
            fontWeight: '800',
            letterSpacing: 0.5,
            color:      selected.length > 0 ? colors.accentText : colors.textMuted,
          }}>
            CONTINUE
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