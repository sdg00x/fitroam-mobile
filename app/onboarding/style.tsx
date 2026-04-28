import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

const ACTIVITIES = [
  { key: 'Staying Active',        label: 'Staying Active',          icon: 'pulse' },
  { key: 'lifting',      label: 'Lifting heavy',     icon: 'barbell' },
  { key: 'running',      label: 'Running',            icon: 'flame' },
  { key: 'calisthenics', label: 'Calisthenics',   icon: 'body-outline' },
  { key: 'crossfit',     label: 'CrossFit',       icon: 'fitness' },
  { key: 'Cycling',        label: 'Cycling',          icon: 'bicycle-outline' },
  { key: 'yoga',         label: ' Pilates', icon: 'leaf' },
] as const

export default function ActivitiesScreen() {
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
    await save({
      primaryActivity: selected[0],
      activities:      selected,
    })
    router.push('/onboarding/facilities')
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>

      {/* Top nav */}
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
            width:            36,
            height:           36,
            borderRadius:     18,
            backgroundColor:  colors.surface,
            borderWidth:      1,
            borderColor:      colors.border,
            alignItems:       'center',
            justifyContent:   'center',
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <Text style={[styles.step, { color: colors.textMuted }]}>STEP 1 OF 5</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          What are you into?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Pick all that apply. Tap your main one first.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ACTIVITIES.map(a => {
            const active   = selected.includes(a.key)
            const isPrimary = active && selected[0] === a.key
            return (
              <TouchableOpacity
                key={a.key}
                onPress={() => toggle(a.key)}
                activeOpacity={0.8}
                style={{
                  width:           '48.5%',
                  padding:         16,
                  borderRadius:    radius.card,
                  borderWidth:     1,
                  borderColor:     active ? colors.accent : colors.border,
                  backgroundColor: active ? 'rgba(200, 255, 87, 0.08)' : colors.surface,
                  position:        'relative',
                }}
              >
                <Ionicons
                  name={a.icon as any}
                  size={26}
                  color={active ? colors.accent : colors.textSecondary}
                  style={{ marginBottom: 10 }}
                />
                <Text style={{
                  fontSize:   14,
                  fontWeight: '700',
                  color:      active ? colors.accent : colors.textPrimary,
                }}>
                  {a.label}
                </Text>
                {isPrimary && (
                  <View style={{
                    position: 'absolute', top: 10, right: 10,
                    backgroundColor: colors.accent,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}>
                    <Text style={{
                      fontSize: 8,
                      fontWeight: '900',
                      color: colors.accentText,
                      letterSpacing: 0.5,
                    }}>
                      PRIMARY
                    </Text>
                  </View>
                )}
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
  title:    { fontSize: 30, fontWeight: '800', letterSpacing: -1, marginBottom: 8, lineHeight: 34 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  footer:   { paddingTop: 12, paddingBottom: 12 },
})