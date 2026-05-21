import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useProfile } from '../../../src/hooks/useProfile'
import { SectionPage } from '../../../src/components/SectionPage'
import { ChipGrid, Chip } from '../../../src/components/ProfileChips'

const LIFESTYLE = [
  { key: 'home_base',        label: 'Home base, train locally' },
  { key: 'frequent_travel',  label: 'Frequent travel' },
  { key: 'nomad',            label: 'Digital nomad' },
  { key: 'between_cities',   label: 'Between cities' },
  { key: 'planning_trip',    label: 'Planning a trip' },
  { key: 'work_trips',       label: 'Work trips' },
]

export default function LifestyleSection() {
  const { profile, save } = useProfile()
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>(profile.lifestyle || [])
  const [saving,   setSaving]   = useState(false)

  const hasChanges =
    JSON.stringify([...selected].sort()) !== JSON.stringify([...(profile.lifestyle || [])].sort())

  function toggle(key: string) {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  async function handleSave() {
    setSaving(true)
    await save({ lifestyle: selected })
    setSaving(false)
    router.back()
  }

  return (
    <SectionPage
      title="How you live"
      subtitle="Helps us prioritise the right places for your routine."
      canSave={hasChanges}
      saving={saving}
      onSave={handleSave}
    >
      <ChipGrid>
        {LIFESTYLE.map(l => (
          <Chip
            key={l.key}
            label={l.label}
            active={selected.includes(l.key)}
            onPress={() => toggle(l.key)}
          />
        ))}
      </ChipGrid>
    </SectionPage>
  )
}
