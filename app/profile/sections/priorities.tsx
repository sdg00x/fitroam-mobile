import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useProfile } from '../../../src/hooks/useProfile'
import { SectionPage } from '../../../src/components/SectionPage'
import { ChipGrid, Chip } from '../../../src/components/ProfileChips'

const PRIORITIES = [
  { key: '24hr',        label: '24-hour access' },
  { key: 'beginner',    label: 'Beginner friendly' },
  { key: 'serious',     label: 'Serious lifters only' },
  { key: 'cleanliness', label: 'Cleanliness' },
  { key: 'deadlift',    label: 'Deadlift platform' },
  { key: 'quiet',       label: 'Quiet at peak times' },
  { key: 'equipment',   label: 'Equipment variety' },
  { key: 'community',   label: 'Strong community' },
  { key: 'pool',        label: 'Pool' },
  { key: 'amenities',   label: 'Showers & amenities' },
]

export default function PrioritiesSection() {
  const { profile, save } = useProfile()
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>(profile.priorities || [])
  const [saving,   setSaving]   = useState(false)

  const hasChanges =
    JSON.stringify([...selected].sort()) !== JSON.stringify([...(profile.priorities || [])].sort())

  function toggle(key: string) {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  async function handleSave() {
    setSaving(true)
    await save({ priorities: selected })
    setSaving(false)
    router.back()
  }

  return (
    <SectionPage
      title="What matters"
      subtitle="We prioritise places that have what you care about."
      canSave={hasChanges}
      saving={saving}
      onSave={handleSave}
    >
      <ChipGrid>
        {PRIORITIES.map(p => (
          <Chip
            key={p.key}
            label={p.label}
            active={selected.includes(p.key)}
            onPress={() => toggle(p.key)}
          />
        ))}
      </ChipGrid>
    </SectionPage>
  )
}
