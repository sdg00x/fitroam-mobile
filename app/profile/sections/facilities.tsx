import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { useProfile } from '../../../src/hooks/useProfile'
import { SectionPage } from '../../../src/components/SectionPage'
import { ChipGrid, Chip } from '../../../src/components/ProfileChips'

const FACILITIES = [
  { key: 'commercial_gym', label: 'Commercial gyms' },
  { key: 'boutique',       label: 'Boutique studios' },
  { key: 'outdoor',        label: 'Outdoor parks' },
  { key: 'pool',           label: 'Swimming pools' },
  { key: 'hotel',          label: 'Hotel gyms' },
  { key: 'home',           label: 'Home / Airbnb' },
]

export default function FacilitiesSection() {
  const { profile, save } = useProfile()
  const router = useRouter()
  const [selected, setSelected] = useState<string[]>(profile.facilityTypes || [])
  const [saving,   setSaving]   = useState(false)

  const hasChanges =
    JSON.stringify([...selected].sort()) !== JSON.stringify([...(profile.facilityTypes || [])].sort())

  function toggle(key: string) {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  async function handleSave() {
    setSaving(true)
    await save({ facilityTypes: selected })
    setSaving(false)
    router.back()
  }

  return (
    <SectionPage
      title="Where you train"
      subtitle="Pick the kinds of places you actually like training at."
      canSave={hasChanges}
      saving={saving}
      onSave={handleSave}
    >
      <ChipGrid>
        {FACILITIES.map(f => (
          <Chip
            key={f.key}
            label={f.label}
            active={selected.includes(f.key)}
            onPress={() => toggle(f.key)}
          />
        ))}
      </ChipGrid>
    </SectionPage>
  )
}
