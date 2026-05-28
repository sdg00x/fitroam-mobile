import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity, ActivityIndicator, StyleSheet, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTheme } from '../src/theme/useTheme'
import { useUser } from "../src/hooks/useUser"
import { useViewingLocation } from '../src/hooks/useViewingLocation'
import { PlacePicker } from '../src/components/PlacePicker'
import { getServiceCoverage } from '../src/lib/serviceCoverage'
import { GymCard, GymData } from '../src/components/GymCard'
import { useProfile } from '../src/hooks/useProfile'
import { Ionicons } from '@expo/vector-icons'

const API_BASE = 'http://192.168.0.64:3000'

const FILTERS = ['All', 'Strength', 'Calisthenics', 'Open now', 'Under £10']

const SORT_OPTIONS = [
  { key: 'match',   label: 'Best match' },
  { key: 'nearest', label: 'Nearest'    },
  { key: 'rating',  label: 'Top rated'  },
  { key: 'price',   label: 'Best price' },
]

export default function ExploreScreen() {
 const { colors, spacing }                            = useTheme()
  const { location: viewingLoc, loading: locLoading, setLocation, resetLocation, isManual } = useViewingLocation()
  const router                                         = useRouter()
  const { profile, loading: profileLoading }           = useProfile()

  // Planning-mode params (set when user taps "Plan this leg" on Trip Detail)
  const params = useLocalSearchParams<{
    planningTripId?:   string
    planningLegId?:    string
    planningTripName?: string
    planningLegOrder?: string
    planningCity?:     string
    planningLat?:      string
    planningLng?:      string
    requiredEquipment?: string
    filterLabel?:       string
  }>()


 const planningMode = !!params.planningTripId && !!params.planningLegId

  // Planning mode: use leg's coordinates.
  // Otherwise: viewing location (manual override or GPS).
  const lat       = planningMode && params.planningLat
    ? parseFloat(params.planningLat)
    : viewingLoc?.lat ?? null
  const lng       = planningMode && params.planningLng
    ? parseFloat(params.planningLng)
    : viewingLoc?.lng ?? null
  const cityName  = planningMode
    ? params.planningCity
    : viewingLoc?.cityName ?? null
  const citySlug  = planningMode
    ? undefined
    : viewingLoc?.citySlug

  const coverage   = getServiceCoverage(citySlug)
  const [pickerOpen, setPickerOpen] = useState(false)

  const [gyms,         setGyms]         = useState<GymData[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeSort,   setActiveSort]   = useState('match')

  const { user, loading: userLoading } = useUser()

 useEffect(() => {
  if (lat && lng && profile.onboarded) fetchGyms()
}, [lat, lng, activeSort, profile.primaryActivity, profile.monthlyBudget, profile.travelDailyBudget, profile.maxDistanceMinutes, params.requiredEquipment])

  async function fetchGyms() {
    if (!lat || !lng) return
    try {
      setLoading(true)
      setError(null)
      // Map activities to backend training style
const styleMap: Record<string, string> = {
  lifting:      'strength',
  calisthenics: 'calisthenics',
  running:      'cardio',
  cycling:      'cardio',
  crossfit:     'crossfit',
  yoga:         'yoga',
  swimming:     'cardio',
  martial_arts: 'mixed',
  classes:      'mixed',
  climbing:     'mixed',
}

// Use travel budget if user is currently in a travelling state
const isTravelling = profile.lifestyle.some(l =>
  ['frequent_travel', 'nomad', 'between_cities', 'planning_trip'].includes(l)
)
const budget = isTravelling ? profile.travelDailyBudget : profile.monthlyBudget

// Map budget keys to backend format
const budgetMap: Record<string, string> = {
  free_only:    'under_5',
  under_10:     '5_to_10',
  '10_to_20':   '10_to_20',
  any_quality:  'over_20',
  under_20:     '5_to_10',
  '20_to_40':   '10_to_20',
  '40_to_80':   '10_to_20',
  over_80:      'over_20',
}

const reqEq = params.requiredEquipment
const apiParams = new URLSearchParams({
  lat:                String(lat),
  lng:                String(lng),
  primaryActivity:    profile.primaryActivity || 'staying_in_shape',
  activities:         profile.activities.join(','),
  facilityTypes:      profile.facilityTypes.join(','),
  lifestyle:          profile.lifestyle.join(','),
  priorities:         profile.priorities.join(','),
  maxDistanceMinutes: String(profile.maxDistanceMinutes),
  radius:             '3000',
  sort:               activeSort,
  ...(reqEq ? { requiredEquipment: reqEq } : {}),
})
      console.log("[Explore] fetching:", `${API_BASE}/api/gyms?${apiParams}`); const res  = await fetch(`${API_BASE}/api/gyms?${apiParams}`)
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      setGyms(data.gyms)
    } catch (err) {
      setError('Could not reach the API. Is it running on port 3000?')
    } finally {
      setLoading(false)
    }
  }

 function handleGymPress(gym: GymData) {
  router.push({
    pathname: '/gym/[id]',
    params: {
      id:               gym.id,
      name:             gym.name,
      address:          gym.address,
      distanceMinutes:  String(gym.distanceMinutes),
      matchScore:       String(gym.matchScore),
      priceDisplay:     gym.priceDisplay,
      priceSubDisplay:  gym.priceSubDisplay,
      equipmentTags:    JSON.stringify(gym.equipmentTags),
      matchReasons:     JSON.stringify(gym.matchReasons),
      openNow:          String(gym.openNow),
      rating:           String(gym.rating ?? ''),
      ratingCount:      String(gym.ratingCount ?? ''),
      dayPassPence:     String(gym.dayPassPence ?? ''),
      monthlyPence:     String(gym.monthlyPence ?? ''),
      openingHoursJson: JSON.stringify(null),
      photoUrls:        JSON.stringify(gym.photoUrls ?? []),
      reviews:          JSON.stringify(gym.reviews ?? []),
      websiteUrl:       gym.websiteUrl ?? '',
    },
  })
}
  async function handleSaveToTrip(gym: GymData) {
    if (!planningMode || !params.planningTripId || !params.planningLegId) return

    try {
      const res = await fetch(
        `${API_BASE}/api/trips/${params.planningTripId}/legs/${params.planningLegId}/gyms`,
        {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || 'seed_user_placeholder',
          },
          body: JSON.stringify({
            gymId:      gym.id,
            matchScore: gym.matchScore,
          }),
        }
      )
      if (!res.ok) throw new Error(`API ${res.status}`)

      // Brief confirmation, then back to Trip Detail
      Alert.alert('Saved', `${gym.name} added to ${params.planningTripName || 'your trip'}.`, [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (err) {
      Alert.alert('Could not save', 'Try again.')
    }
  }

  const topGym     = gyms[0]
  const nearbyGyms = gyms.slice(1)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>

      
      {/* Planning mode banner */}
      {planningMode && (
        <View style={{
          backgroundColor:   colors.accent,
          paddingHorizontal: spacing.screen,
          paddingVertical:   10,
          flexDirection:     'row',
          alignItems:        'center',
          justifyContent:    'space-between',
        }}>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize:      10,
              fontWeight:    '800',
              color:         colors.accentText,
              letterSpacing: 1,
              opacity:       0.7,
            }}>
              PLANNING MODE
            </Text>
            <Text style={{
              fontSize:   13,
              fontWeight: '700',
              color:      colors.accentText,
              marginTop:  2,
            }}>
              Leg {params.planningLegOrder || ''} of {params.planningTripName || 'your trip'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={{
              fontSize:      11,
              fontWeight:    '800',
              color:         colors.accentText,
              letterSpacing: 0.5,
            }}>
              EXIT ✕
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hero */}
      <View style={[styles.hero, {
        backgroundColor:   colors.heroBackground,
        paddingHorizontal: spacing.screen,
      }]}>

        <Text style={{
          fontSize:      11,
          color:         colors.textMuted,
          fontWeight:    '600',
          letterSpacing: 1,
          textTransform: 'uppercase',
          marginBottom:  3,
        }}>
          You're in
        </Text>
       <TouchableOpacity
          onPress={() => !planningMode && setPickerOpen(true)}
          activeOpacity={planningMode ? 1 : 0.7}
          disabled={planningMode}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              fontSize:      28,
              fontWeight:    '800',
              color:         colors.textPrimary,
              letterSpacing: -1,
              lineHeight:    30,
            }}>
              {locLoading ? 'Locating...' : cityName || 'Pick a city'}
            </Text>
            {!planningMode && (
              <Ionicons
                name="chevron-down"
                size={20}
                color={colors.textMuted}
                style={{ marginLeft: 6, marginTop: 4 }}
              />
            )}
          </View>
        </TouchableOpacity>
        <Text style={{
          fontSize:  13,
          color:     colors.textSecondary,
          marginTop: 6,
        }}>
          {gyms.length > 0
            ? `${gyms.length} gyms match your training`
            : 'Finding gyms'
          }
        </Text>
      </View>

      {/* Sort tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingTop:        spacing.sm,
          paddingBottom:     4,
          gap:               6,
        }}
        style={{ flexGrow: 0, backgroundColor: colors.background }}
      >
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setActiveSort(opt.key)}
            activeOpacity={0.75}
            style={{
              paddingHorizontal: 14,
              paddingVertical:   7,
              borderRadius:      100,
              borderWidth:       1,
              borderColor:       activeSort === opt.key
                ? colors.textPrimary
                : colors.border,
              backgroundColor:   activeSort === opt.key
                ? colors.textPrimary
                : 'transparent',
            }}
          >
            <Text style={{
              fontSize:   11,
              fontWeight: '700',
              color:      activeSort === opt.key
                ? colors.background
                : colors.textSecondary,
            }}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingVertical:   spacing.sm,
          gap:               7,
        }}
        style={{ flexGrow: 0, backgroundColor: colors.background }}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            activeOpacity={0.75}
            style={[styles.chip, {
              backgroundColor: activeFilter === f
                ? colors.surfaceRaised
                : 'transparent',
              borderRadius:    6,
              paddingHorizontal: 13,
              paddingVertical:    5,
              borderWidth:       1,
              borderColor:       activeFilter === f
                ? colors.border
                : 'transparent',
            }]}
          >
            <Text style={{
              fontSize:   11,
              fontWeight: '600',
              color:      activeFilter === f
                ? colors.textSecondary
                : colors.textMuted,
            }}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator color={colors.accent} />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            {gyms.length > 0
              ? <Text style={{ color: colors.accent }}>{gyms.length} gyms</Text>
              : <Text style={{ color: colors.textMuted }}>Finding gyms</Text>
            }{' '}match your training
          </Text>
          {!planningMode && coverage.serviceTier === 'concierge' && (
            <View style={{
              marginLeft:        8,
              paddingHorizontal: 8,
              paddingVertical:   2,
              borderRadius:      100,
              backgroundColor:   colors.accent,
            }}>
              <Text style={{
                fontSize:      9,
                fontWeight:    '800',
                color:         colors.accentText,
                letterSpacing: 0.5,
              }}>
                INSTANT BOOKING
              </Text>
            </View>
          )}
          {!planningMode && isManual && (
            <TouchableOpacity onPress={resetLocation} hitSlop={6} style={{ marginLeft: 8 }}>
              <Text style={{
                fontSize:   11,
                fontWeight: '700',
                color:      colors.textMuted,
                textDecorationLine: 'underline',
              }}>
                Use my location
              </Text>
            </TouchableOpacity>
          )}
        </View>
        </View>
      ) : error ? (
        <View style={styles.centred}>
          <Text style={{
            color:             colors.error,
            fontSize:          13,
            textAlign:         'center',
            paddingHorizontal: 32,
          }}>
            {error}
          </Text>
          <TouchableOpacity onPress={fetchGyms} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : gyms.length === 0 ? (
        <View style={styles.centred}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            No gyms found nearby
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.screen,
            paddingBottom:     40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {topGym && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                Top match
              </Text>
              <GymCard
                gym={topGym}
                variant="featured"
                onPress={handleGymPress}
                onGoHere={handleGymPress}
                planningMode={planningMode}
                onSaveToTrip={handleSaveToTrip}
              />
            </>
          )}
          {nearbyGyms.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                Nearby
              </Text>
              {nearbyGyms.map(gym => (
                <GymCard
                  key={gym.id}
                  gym={gym}
                  variant="compact"
                  onPress={handleGymPress}
                  planningMode={planningMode}
                  onSaveToTrip={handleSaveToTrip}
                />

              ))}
            </>
          )}
        </ScrollView>
      )}

      <PlacePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        showCurrentLocation={true}
        onUseCurrentLocation={resetLocation}
        onPick={(place) => {
          setLocation({
            lat:              place.lat,
            lng:              place.lng,
            cityName:         place.city || place.name,
            citySlug:         place.citySlug,
            country:          place.country,
            placeId:          place.placeId,
            formattedAddress: place.formattedAddress,
          })
          setPickerOpen(false)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:    { flex: 1 },
  hero:    { paddingTop: 16, paddingBottom: 20 },
  centred: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chip:    { flexShrink: 0 },
  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop:     14,
    marginBottom:  8,
  },
})