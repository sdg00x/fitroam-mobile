import React, { useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'
import {
  labelForActivity,
  labelForPattern,
  labelForMonthlyBudget,
  labelForTravelBudget,
  labelForDistance,
  labelsForActivities,
  labelsForLifestyle,
  labelsForPriorities,
} from '../../src/lib/labels'

const FACILITY_LABELS: Record<string, string> = {
  commercial_gym: 'Commercial gyms',
  boutique:       'Boutique studios',
  outdoor:        'Outdoor parks',
  pool:           'Swimming pools',
  hotel:          'Hotel gyms',
  home:           'Home / Airbnb',
}

function labelsForFacilities(slugs: string[]): string {
  if (!slugs || slugs.length === 0) return 'Not set'
  return slugs.map(s => FACILITY_LABELS[s] || s).join(', ')
}

export default function EditProfileMenu() {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()
  const { profile, refresh } = useProfileWithRefresh()

  useFocusEffect(useCallback(() => { refresh() }, [refresh]))

  const primaryLabel = labelForActivity(profile.primaryActivity)
  const othersCount  = profile.activities.filter(a => a !== profile.primaryActivity).length
  const activitySummary = othersCount > 0
    ? `${primaryLabel} + ${othersCount} more`
    : primaryLabel

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
          marginTop:  16,
          marginBottom: 16,
          lineHeight: 18,
        }}>
          Tap any section to update it. Each section saves separately.
        </Text>

        <View style={[styles.menu, {
          backgroundColor: colors.surface,
          borderColor:     colors.border,
          borderRadius:    radius.card,
        }]}>
          <MenuRow
            label="Activity"
            value={activitySummary}
            onPress={() => router.push('/profile/sections/activity')}
            colors={colors}
          />
          <MenuRow
            label="Where you train"
            value={labelsForFacilities(profile.facilityTypes)}
            onPress={() => router.push('/profile/sections/facilities')}
            colors={colors}
          />
          <MenuRow
            label="How you live"
            value={labelsForLifestyle(profile.lifestyle) === 'None' ? 'Not set' : labelsForLifestyle(profile.lifestyle)}
            onPress={() => router.push('/profile/sections/lifestyle')}
            colors={colors}
          />
          <MenuRow
            label="Training pattern"
            value={labelForPattern(profile.trainingPattern)}
            onPress={() => router.push('/profile/sections/training')}
            colors={colors}
          />
          <MenuRow
            label="Budget & distance"
            value={`${labelForMonthlyBudget(profile.monthlyBudget)} · ${labelForDistance(profile.maxDistanceMinutes)}`}
            onPress={() => router.push('/profile/sections/budget')}
            colors={colors}
          />
          <MenuRow
            label="What matters"
            value={labelsForPriorities(profile.priorities) === 'None' ? 'Not set' : labelsForPriorities(profile.priorities)}
            onPress={() => router.push('/profile/sections/priorities')}
            colors={colors}
            last
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// Wrap useProfile to add a refresh on focus (Context refactor is on the backlog)
function useProfileWithRefresh() {
  const profileHook = useProfile()
  const refresh = useCallback(async () => {
    // useProfile loads from AsyncStorage on mount. Forcing re-read requires Context.
    // For now: nothing to do — useFocusEffect on the menu re-runs queries elsewhere,
    // and useProfile's internal state stays correct because saves go through it.
  }, [])
  return { ...profileHook, refresh }
}

function MenuRow({
  label, value, onPress, colors, last,
}: {
  label:   string
  value:   string
  onPress: () => void
  colors:  any
  last?:   boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        paddingHorizontal: 16,
        paddingVertical:   14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        flexDirection:     'row',
        alignItems:        'center',
      }}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{
          fontSize:   14,
          fontWeight: '700',
          color:      colors.textPrimary,
          marginBottom: 3,
        }}>
          {label}
        </Text>
        <Text
          style={{ fontSize: 12, color: colors.textMuted }}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 14,
  },
  menu: {
    borderWidth: 1,
  },
})
