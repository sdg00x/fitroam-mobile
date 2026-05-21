import React, { useState } from 'react'
import { View, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../../src/theme/useTheme'
import { useProfile } from '../../../src/hooks/useProfile'
import { SectionPage } from '../../../src/components/SectionPage'
import { ChipGrid, Chip } from '../../../src/components/ProfileChips'

const ACTIVITIES = [
  { key: 'lifting',      label: 'Strength training' },
  { key: 'calisthenics', label: 'Calisthenics' },
  { key: 'running',      label: 'Running' },
  { key: 'cycling',      label: 'Cycling' },
  { key: 'crossfit',     label: 'CrossFit / Hyrox' },
  { key: 'yoga',         label: 'Yoga / Pilates' },
  { key: 'swimming',     label: 'Swimming' },
  { key: 'martial_arts', label: 'Martial arts' },
  { key: 'classes',      label: 'Group classes' },
  { key: 'climbing',     label: 'Climbing' },
]

export default function ActivitySection() {
  const { colors } = useTheme()
  const { profile, save } = useProfile()
  const router = useRouter()

  const [primary,    setPrimary]    = useState(profile.primaryActivity)
  const [others,     setOthers]     = useState<string[]>(profile.activities.filter(a => a !== profile.primaryActivity))
  const [saving,     setSaving]     = useState(false)

  const hasChanges =
    primary !== profile.primaryActivity ||
    JSON.stringify([...others].sort()) !== JSON.stringify([...profile.activities.filter(a => a !== profile.primaryActivity)].sort())

  function setNewPrimary(key: string) {
    setPrimary(key)
    setOthers(prev => prev.filter(k => k !== key))
  }

  function toggleOther(key: string) {
    if (key === primary) return
    setOthers(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  async function handleSave() {
    setSaving(true)
    const activities = primary ? [primary, ...others] : others
    await save({ primaryActivity: primary, activities })
    setSaving(false)
    router.back()
  }

  return (
    <SectionPage
      title="Activity"
      subtitle="Your primary activity drives most matches. Other activities are weighted lower."
      canSave={hasChanges}
      saving={saving}
      onSave={handleSave}
    >
      <Text style={{
        fontSize:      11,
        fontWeight:    '700',
        letterSpacing: 1.2,
        color:         colors.textMuted,
        marginBottom:  12,
      }}>
        PRIMARY ACTIVITY
      </Text>
      <ChipGrid>
        {ACTIVITIES.map(a => (
          <Chip
            key={a.key}
            label={a.label}
            active={primary === a.key}
            onPress={() => setNewPrimary(a.key)}
          />
        ))}
      </ChipGrid>

      <Text style={{
        fontSize:      11,
        fontWeight:    '700',
        letterSpacing: 1.2,
        color:         colors.textMuted,
        marginTop:     28,
        marginBottom:  12,
      }}>
        OTHER ACTIVITIES YOU ENJOY
      </Text>
      <ChipGrid>
        {ACTIVITIES.filter(a => a.key !== primary).map(a => (
          <Chip
            key={a.key}
            label={a.label}
            active={others.includes(a.key)}
            onPress={() => toggleOther(a.key)}
          />
        ))}
      </ChipGrid>
    </SectionPage>
  )
}
