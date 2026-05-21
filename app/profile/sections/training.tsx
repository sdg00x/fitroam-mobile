import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useProfile } from '../../../src/hooks/useProfile'
import { SectionPage } from '../../../src/components/SectionPage'
import { ChipGrid, Chip } from '../../../src/components/ProfileChips'

const PATTERNS = [
  { key: 'ppl',         label: 'Push / Pull / Legs',    sub: '3-day rotation, classic split' },
  { key: 'upper_lower', label: 'Upper / Lower',         sub: '4-day, alternating body halves' },
  { key: 'full_body',   label: 'Full body',             sub: 'Every session works everything' },
  { key: 'body_part',   label: 'Body-part split',       sub: 'Chest day, back day, leg day' },
  { key: 'program',     label: 'I follow a program',    sub: 'Stronglifts, 5/3/1, GZCL, etc' },
  { key: 'freestyle',   label: 'Freestyle',             sub: 'Whatever feels right that day' },
]

export default function TrainingSection() {
  const { profile, save } = useProfile()
  const router = useRouter()
  const [pattern, setPattern] = useState<string | null>(profile.trainingPattern)
  const [saving,  setSaving]  = useState(false)

  const hasChanges = pattern !== profile.trainingPattern

  async function handleSave() {
    setSaving(true)
    await save({ trainingPattern: pattern })
    setSaving(false)
    router.back()
  }

  return (
    <SectionPage
      title="Training pattern"
      subtitle="So we match the equipment you need to the days you need it."
      canSave={hasChanges}
      saving={saving}
      onSave={handleSave}
    >
      <ChipGrid>
        <Chip
          label="Not set"
          active={pattern === null}
          onPress={() => setPattern(null)}
        />
        {PATTERNS.map(p => (
          <Chip
            key={p.key}
            label={p.label}
            sub={p.sub}
            active={pattern === p.key}
            onPress={() => setPattern(p.key)}
          />
        ))}
      </ChipGrid>
    </SectionPage>
  )
}
