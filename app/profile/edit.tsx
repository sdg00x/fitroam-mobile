import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'

// Option sets mirror the onboarding screens
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

const FACILITIES = [
  { key: 'commercial_gym', label: 'Commercial gyms' },
  { key: 'boutique',       label: 'Boutique studios' },
  { key: 'outdoor',        label: 'Outdoor parks' },
  { key: 'pool',           label: 'Swimming pools' },
  { key: 'hotel',          label: 'Hotel gyms' },
  { key: 'home',           label: 'Home / Airbnb' },
]

const LIFESTYLE = [
  { key: 'home_base',        label: 'Home base, train locally' },
  { key: 'frequent_travel',  label: 'Frequent travel' },
  { key: 'nomad',            label: 'Digital nomad' },
  { key: 'between_cities',   label: 'Between cities' },
  { key: 'planning_trip',    label: 'Planning a trip' },
  { key: 'work_trips',       label: 'Work trips' },
]

const MONTHLY_BUDGET = [
  { key: 'under_20',    label: 'Under £20' },
  { key: '20_to_40',    label: '£20 – £40' },
  { key: '40_to_80',    label: '£40 – £80' },
  { key: 'over_80',     label: 'Over £80' },
]

const TRAVEL_BUDGET = [
  { key: 'free_only',   label: 'Free or hotel gym only' },
  { key: 'under_10',    label: 'Under £10 / day' },
  { key: '10_to_20',    label: '£10 – £20 / day' },
  { key: 'any_quality', label: 'Whatever it takes' },
]

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

const DISTANCES = [
  { key: 5,  label: 'Walking distance' },
  { key: 15, label: 'Short distance' },
  { key: 60, label: "I'll travel for it" },
]

const PATTERNS = [
  { key: 'ppl',         label: 'Push / Pull / Legs' },
  { key: 'upper_lower', label: 'Upper / Lower' },
  { key: 'full_body',   label: 'Full body' },
  { key: 'body_part',   label: 'Body-part split' },
  { key: 'program',     label: 'Follow a program' },
  { key: 'freestyle',   label: 'Freestyle' },
]

export default function EditProfileScreen() {
  const { colors, spacing, radius } = useTheme()
  const { profile, save } = useProfile()
  const router = useRouter()

  function toggleArray(field: 'activities' | 'facilityTypes' | 'lifestyle' | 'priorities', key: string) {
    const current = profile[field] || []
    const next = current.includes(key)
      ? current.filter((k: string) => k !== key)
      : [...current, key]
    save({ [field]: next })
  }

  function setPrimary(key: string) {
    // Primary activity is also added to the activities array
    const activities = profile.activities.includes(key)
      ? profile.activities
      : [...profile.activities, key]
    save({ primaryActivity: key, activities })
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
          Edit profile
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{
          fontSize:   13,
          color:      colors.textMuted,
          marginTop:  12,
          marginBottom: 24,
        }}>
          Changes save automatically. Recommendations update next time you open Explore.
        </Text>

        {/* Primary activity */}
        <Section label="PRIMARY ACTIVITY" colors={colors}>
          <View style={chipRow}>
            {ACTIVITIES.map(a => (
              <Chip
                key={a.key}
                label={a.label}
                active={profile.primaryActivity === a.key}
                onPress={() => setPrimary(a.key)}
                colors={colors}
              />
            ))}
          </View>
        </Section>

        {/* Other activities */}
        <Section label="OTHER ACTIVITIES" colors={colors}>
          <View style={chipRow}>
            {ACTIVITIES.filter(a => a.key !== profile.primaryActivity).map(a => (
              <Chip
                key={a.key}
                label={a.label}
                active={profile.activities.includes(a.key)}
                onPress={() => toggleArray('activities', a.key)}
                colors={colors}
              />
            ))}
          </View>
        </Section>

        {/* Facility types */}
        <Section label="WHERE YOU TRAIN" colors={colors}>
          <View style={chipRow}>
            {FACILITIES.map(f => (
              <Chip
                key={f.key}
                label={f.label}
                active={profile.facilityTypes.includes(f.key)}
                onPress={() => toggleArray('facilityTypes', f.key)}
                colors={colors}
              />
            ))}
          </View>
        </Section>

        {/* Lifestyle */}
        <Section label="HOW YOU LIVE" colors={colors}>
          <View style={chipRow}>
            {LIFESTYLE.map(l => (
              <Chip
                key={l.key}
                label={l.label}
                active={profile.lifestyle.includes(l.key)}
                onPress={() => toggleArray('lifestyle', l.key)}
                colors={colors}
              />
            ))}
          </View>
        </Section>

        {/* Training pattern */}
        <Section label="TRAINING PATTERN" colors={colors}>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10, marginTop: -4 }}>
            Helps us match gyms to the equipment you need each day.
          </Text>
          <View style={chipRow}>
            <Chip
              label="Not set"
              active={!profile.trainingPattern}
              onPress={() => save({ trainingPattern: null })}
              colors={colors}
            />
            {PATTERNS.map(p => (
              <Chip
                key={p.key}
                label={p.label}
                active={profile.trainingPattern === p.key}
                onPress={() => save({ trainingPattern: p.key })}
                colors={colors}
              />
            ))}
          </View>
        </Section>

        {/* Monthly budget */}
        <Section label="MONTHLY BUDGET" colors={colors}>
          <View style={chipRow}>
            {MONTHLY_BUDGET.map(b => (
              <Chip
                key={b.key}
                label={b.label}
                active={profile.monthlyBudget === b.key}
                onPress={() => save({ monthlyBudget: b.key })}
                colors={colors}
              />
            ))}
          </View>
        </Section>

        {/* Travel budget */}
        <Section label="TRAVEL DAILY BUDGET" colors={colors}>
          <View style={chipRow}>
            {TRAVEL_BUDGET.map(b => (
              <Chip
                key={b.key}
                label={b.label}
                active={profile.travelDailyBudget === b.key}
                onPress={() => save({ travelDailyBudget: b.key })}
                colors={colors}
              />
            ))}
          </View>
        </Section>

        {/* Distance */}
        <Section label="HOW FAR WILL YOU TRAVEL" colors={colors}>
          <View style={chipRow}>
            {DISTANCES.map(d => (
              <Chip
                key={String(d.key)}
                label={d.label}
                active={profile.maxDistanceMinutes === d.key}
                onPress={() => save({ maxDistanceMinutes: d.key })}
                colors={colors}
              />
            ))}
          </View>
        </Section>

        {/* Priorities */}
        <Section label="WHAT MATTERS" colors={colors}>
          <View style={chipRow}>
            {PRIORITIES.map(p => (
              <Chip
                key={p.key}
                label={p.label}
                active={profile.priorities.includes(p.key)}
                onPress={() => toggleArray('priorities', p.key)}
                colors={colors}
              />
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  )
}

// Small components
function Section({ label, colors, children }: { label: string; colors: any; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 28 }}>
      <Text style={{
        fontSize:      11,
        fontWeight:    '700',
        letterSpacing: 1.2,
        color:         colors.textMuted,
        marginBottom:  12,
        textTransform: 'uppercase',
      }}>
        {label}
      </Text>
      {children}
    </View>
  )
}

function Chip({ label, active, onPress, colors }: { label: string; active: boolean; onPress: () => void; colors: any }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingVertical:   10,
        paddingHorizontal: 14,
        borderRadius:      100,
        borderWidth:       1,
        borderColor:       active ? colors.accent : colors.border,
        backgroundColor:   active ? 'rgba(200, 255, 87, 0.08)' : colors.surface,
      }}
    >
      <Text style={{
        fontSize:   12,
        fontWeight: '700',
        color:      active ? colors.accent : colors.textPrimary,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

const chipRow = {
  flexDirection: 'row' as const,
  flexWrap:      'wrap' as const,
  gap:           8,
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 14,
  },
})
