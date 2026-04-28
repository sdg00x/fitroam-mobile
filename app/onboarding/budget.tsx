import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

const BUDGETS = [
  { key: 'under_10',    label: 'Under £10' },
  { key: '10_to_20',    label: '£10–20' },
  { key: '20_to_40',    label: '£20–40' },
  { key: 'over_40',     label: '£40+' },
  { key: 'any_quality', label: 'Whatever it takes' },
]

export default function BudgetScreen() {
  const { colors, spacing, radius } = useTheme()
  const { save } = useProfile()
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  async function handleNext() {
    if (!selected) return
    await save({
      monthlyBudget:     selected,
      travelDailyBudget: selected,
    })
    router.push('/onboarding/priorities')
  }

  async function handleSkip() {
    await save({
      monthlyBudget:     'any_quality',
      travelDailyBudget: 'any_quality',
    })
    router.push('/onboarding/priorities')
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
        <Text style={[styles.step, { color: colors.textMuted }]}>STEP 4 OF 5</Text>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          How much would you spend on the go?
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Per day, when you need access somewhere new.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {BUDGETS.map(b => {
          const active = selected === b.key
          return (
            <TouchableOpacity
              key={b.key}
              onPress={() => setSelected(b.key)}
              activeOpacity={0.8}
              style={{
                padding:         spacing.card,
                borderRadius:    radius.card,
                borderWidth:     1,
                borderColor:     active ? colors.accent : colors.border,
                backgroundColor: active ? 'rgba(200, 255, 87, 0.08)' : colors.surface,
                marginBottom:    8,
              }}
            >
              <Text style={{
                fontSize:   16,
                fontWeight: '700',
                color:      active ? colors.accent : colors.textPrimary,
              }}>
                {b.label}
              </Text>
            </TouchableOpacity>
          )
        })}
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
            fontSize:   15,
            fontWeight: '800',
            letterSpacing: 0.5,
            color:      selected ? colors.accentText : colors.textMuted,
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