import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

const CITIES = [
  { slug: 'london-gb',  label: 'London',   sub: 'United Kingdom' },
  { slug: 'newyork-us', label: 'New York', sub: 'United States' },
  { slug: 'miami-us',   label: 'Miami',    sub: 'United States' },
]

export default function CityScreen() {
  const { colors, spacing, radius } = useTheme()
  const { save } = useProfile()
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  async function handleNext() {
    if (!selected) return
    await save({ citySlug: selected })
    router.push('/onboarding/style')
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.screen, paddingTop: 24 }]}>
        <Text style={[styles.step, { color: colors.textMuted }]}>STEP 1 OF 3</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Where are you training?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          We're live in three cities to start. More coming soon.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 8 }}>
          {CITIES.map(c => {
            const active = selected === c.slug
            return (
              <TouchableOpacity
                key={c.slug}
                onPress={() => setSelected(c.slug)}
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
                  fontSize:     16,
                  fontWeight:   '700',
                  color:        active ? colors.accent : colors.textPrimary,
                  marginBottom: 3,
                }}>
                  {c.label}
                </Text>
                <Text style={{
                  fontSize: 12,
                  color:    active ? colors.accent : colors.textMuted,
                  opacity:  active ? 0.85 : 1,
                }}>
                  {c.sub}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.screen, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.85}
          style={{
            backgroundColor: selected ? colors.accent : colors.surfaceRaised,
            paddingVertical: 16,
            borderRadius:    radius.card,
            alignItems:      'center',
          }}
        >
          <Text style={{
            fontSize:      15,
            fontWeight:    '800',
            letterSpacing: 0.5,
            color:         selected ? colors.accentText : colors.textMuted,
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
