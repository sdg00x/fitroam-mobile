import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../../src/theme/useTheme'
import { useProfile } from '../../../src/hooks/useProfile'
import { SectionPage } from '../../../src/components/SectionPage'
import { ChipGrid, Chip } from '../../../src/components/ProfileChips'

const MONTHLY_BUDGET = [
  { key: 'under_20', label: 'Under £20' },
  { key: '20_to_40', label: '£20 – £40' },
  { key: '40_to_80', label: '£40 – £80' },
  { key: 'over_80',  label: 'Over £80' },
]

const TRAVEL_BUDGET = [
  { key: 'free_only',   label: 'Free / hotel gym' },
  { key: 'under_10',    label: 'Under £10/day' },
  { key: '10_to_20',    label: '£10–£20/day' },
  { key: 'any_quality', label: 'Whatever it takes' },
]

const DISTANCES = [
  { key: 5,  label: 'Walking distance' },
  { key: 15, label: 'Short distance' },
  { key: 60, label: "I'll travel for it" },
]

export default function BudgetSection() {
  const { colors } = useTheme()
  const { profile, save } = useProfile()
  const router = useRouter()

  const [monthly,  setMonthly]  = useState(profile.monthlyBudget)
  const [travel,   setTravel]   = useState(profile.travelDailyBudget)
  const [distance, setDistance] = useState(profile.maxDistanceMinutes)
  const [saving,   setSaving]   = useState(false)

  const hasChanges =
    monthly  !== profile.monthlyBudget ||
    travel   !== profile.travelDailyBudget ||
    distance !== profile.maxDistanceMinutes

  async function handleSave() {
    setSaving(true)
    await save({
      monthlyBudget:      monthly,
      travelDailyBudget:  travel,
      maxDistanceMinutes: distance,
    })
    setSaving(false)
    router.back()
  }

  return (
    <SectionPage
      title="Budget & distance"
      canSave={hasChanges}
      saving={saving}
      onSave={handleSave}
    >
      <SectionLabel colors={colors}>MONTHLY BUDGET</SectionLabel>
      <ChipGrid>
        {MONTHLY_BUDGET.map(b => (
          <Chip
            key={b.key}
            label={b.label}
            active={monthly === b.key}
            onPress={() => setMonthly(b.key)}
          />
        ))}
      </ChipGrid>

      <View style={{ height: 22 }} />

      <SectionLabel colors={colors}>TRAVEL DAILY BUDGET</SectionLabel>
      <ChipGrid>
        {TRAVEL_BUDGET.map(b => (
          <Chip
            key={b.key}
            label={b.label}
            active={travel === b.key}
            onPress={() => setTravel(b.key)}
          />
        ))}
      </ChipGrid>

      <View style={{ height: 22 }} />

      <SectionLabel colors={colors}>HOW FAR WILL YOU TRAVEL</SectionLabel>
      <ChipGrid>
        {DISTANCES.map(d => (
          <Chip
            key={String(d.key)}
            label={d.label}
            active={distance === d.key}
            onPress={() => setDistance(d.key)}
          />
        ))}
      </ChipGrid>
    </SectionPage>
  )
}

function SectionLabel({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <Text style={{
      fontSize:      11,
      fontWeight:    '700',
      letterSpacing: 1.2,
      color:         colors.textMuted,
      marginBottom:  10,
    }}>
      {children}
    </Text>
  )
}
