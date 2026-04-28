import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

const FACILITIES = [
  { key: 'gyms',     label: 'Gyms',                       icon: 'barbell' },
  { key: 'parks',    label: 'Outdoor & Calisthenics Spots', icon: 'sunny' },
  { key: 'routes',   label: 'Running routes',             icon: 'trail-sign' },
  { key: 'discover', label: 'All of the above',           icon: 'compass' },
] as const

const ACTIVITY_TO_FACILITY: Record<string, string[]> = {
  lifting:      ['gyms'],
  calisthenics: ['parks', 'gyms'],
  running:      ['routes'],
  crossfit:     ['gyms'],
  hyrox:        ['gyms'],
  yoga:         ['studios'],
  swimming:     ['pools'],
}

export default function FacilitiesScreen() {
  const { colors, spacing, radius } = useTheme()
  const { profile, save } = useProfile()
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    const suggested = new Set<string>()
    profile.activities.forEach(a => {
      ACTIVITY_TO_FACILITY[a]?.forEach(f => suggested.add(f))
    })
    setSelected([...suggested])
  }, [profile.activities])

  function toggle(key: string) {
    setSelected(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleNext() {
    if (selected.length === 0) return
    await save({ facilityTypes: selected })
    router.push('/onboarding/lifestyle')
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
        <Text style={[styles.step, { color: colors.textMuted }]}>STEP 2 OF 5</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Where would you want to train?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          We'll show you the spots that match.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FACILITIES.map(f => {
            const active = selected.includes(f.key)
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => toggle(f.key)}
                activeOpacity={0.8}
                style={{
                  width:           '48.5%',
                  padding:         16,
                  borderRadius:    radius.card,
                  borderWidth:     1,
                  borderColor:     active ? colors.accent : colors.border,
                  backgroundColor: active ? 'rgba(200, 255, 87, 0.08)' : colors.surface,
                  minHeight:       100,
                }}
              >
                <Ionicons
                  name={f.icon as any}
                  size={26}
                  color={active ? colors.accent : colors.textSecondary}
                  style={{ marginBottom: 10 }}
                />
                <Text style={{
                  fontSize:   13,
                  fontWeight: '700',
                  color:      active ? colors.accent : colors.textPrimary,
                  lineHeight: 17,
                }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
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
  title:    { fontSize: 28, fontWeight: '800', letterSpacing: -1, marginBottom: 8, lineHeight: 32 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  footer:   { paddingTop: 12, paddingBottom: 12 },
})