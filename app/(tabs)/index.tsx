import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTheme } from '../../src/theme/useTheme'
import { useLocation } from '../../src/hooks/useLocation'
import { GymCard, GymData } from '../../src/components/GymCard'

const API_BASE = 'http://192.168.0.64:3000'

const FILTERS = ['All', 'Strength', 'Calisthenics', 'Open now', 'Under £10']

const SORT_OPTIONS = [
  { key: 'match',   label: 'Best match' },
  { key: 'nearest', label: 'Nearest'    },
  { key: 'rating',  label: 'Top rated'  },
  { key: 'price',   label: 'Best price' },
]

export default function DiscoverScreen() {
  const { colors, spacing }                         = useTheme()
  const { lat, lng, cityName, loading: locLoading } = useLocation()
  const router                                      = useRouter()

  const [gyms,         setGyms]         = useState<GymData[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeSort,   setActiveSort]   = useState('match')

  useEffect(() => {
    if (lat && lng) fetchGyms()
  }, [lat, lng, activeSort])

  async function fetchGyms() {
    if (!lat || !lng) return
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        lat:    String(lat),
        lng:    String(lng),
        style:  'strength',
        budget: '10_to_20',
        radius: '3000',
        sort:   activeSort,
      })
      const res  = await fetch(`${API_BASE}/api/gyms?${params}`)
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
    },
  })
}

  const topGym     = gyms[0]
  const nearbyGyms = gyms.slice(1)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>

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
        <Text style={{
          fontSize:      28,
          fontWeight:    '800',
          color:         colors.textPrimary,
          letterSpacing: -1,
          lineHeight:    30,
        }}>
          {locLoading ? 'Locating...' : cityName}
          <Text style={{ color: colors.accent }}> ·</Text>
        </Text>
        <Text style={{
          fontSize:  13,
          color:     colors.textMuted,
          marginTop: 4,
        }}>
          {gyms.length > 0
            ? <Text style={{ color: colors.accent }}>{gyms.length} gyms</Text>
            : <Text style={{ color: colors.textMuted }}>Finding gyms</Text>
          }{' '}match your training
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
              paddingHorizontal: 13,
              paddingVertical:   6,
              borderRadius:      100,
              borderWidth:       1,
              borderColor:       activeSort === opt.key
                ? colors.accent
                : colors.border,
              backgroundColor:   activeSort === opt.key
                ? colors.accent
                : colors.surfaceRaised,
            }}
          >
            <Text style={{
              fontSize:   11,
              fontWeight: '700',
              color:      activeSort === opt.key
                ? colors.accentText
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
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 8 }}>
            Finding gyms...
          </Text>
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
                />
              ))}
            </>
          )}
        </ScrollView>
      )}

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