import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, SafeAreaView,
  TouchableOpacity, ActivityIndicator, StyleSheet,
} from 'react-native'
import { useTheme } from '../../src/theme/useTheme'
import { GymCard, GymData } from '../../src/components/GymCard'

const API_BASE = 'http://192.168.0.64:3000'
const DEV_LAT    = 51.5074
const DEV_LNG    = -0.1278
const FILTERS    = ['All', 'Strength', 'Calisthenics', 'Open now', 'Under £10']

export default function DiscoverScreen() {
  const { colors, spacing } = useTheme()
  const [gyms,         setGyms]         = useState<GymData[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => { fetchGyms() }, [])

  async function fetchGyms() {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        lat:    String(DEV_LAT),
        lng:    String(DEV_LNG),
        style:  'strength',
        budget: '10_to_20',
        radius: '5000',
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

  const topGym     = gyms[0]
  const nearbyGyms = gyms.slice(1)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>

      {/* Hero */}
      <View style={[styles.hero, {
        backgroundColor:  colors.heroBackground,
        paddingHorizontal: spacing.screen,
      }]}>
        <Text style={{ fontSize: 11, color: colors.textMuted, fontWeight: '600',
          letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>
          You're in
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary,
          letterSpacing: -1, lineHeight: 30 }}>
          London<Text style={{ color: colors.accent }}> ·</Text>
        </Text>
        <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          <Text style={{ color: colors.accent }}>{gyms.length} gyms</Text> match your training
        </Text>
      </View>

      {/* Filters */}
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
              backgroundColor: activeFilter === f ? colors.accent : colors.surfaceRaised,
              borderRadius:    6,
              paddingHorizontal: 13,
              paddingVertical:    5,
            }]}
          >
            <Text style={{
              fontSize:   11,
              fontWeight: '700',
              color:      activeFilter === f ? colors.accentText : colors.textSecondary,
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
          <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center', paddingHorizontal: 32 }}>
            {error}
          </Text>
          <TouchableOpacity onPress={fetchGyms} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : gyms.length === 0 ? (
        <View style={styles.centred}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>No gyms found nearby</Text>
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
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Top match</Text>
              <GymCard
                gym={topGym}
                variant="featured"
                onGoHere={g => console.log('Going to:', g.name)}
              />
            </>
          )}
          {nearbyGyms.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Nearby</Text>
              {nearbyGyms.map(gym => (
                <GymCard
                  key={gym.id}
                  gym={gym}
                  variant="compact"
                  onPress={g => console.log('Tapped:', g.name)}
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
  safe:         { flex: 1 },
  hero:         { paddingTop: 16, paddingBottom: 20 },
  centred:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  chip:         { flexShrink: 0 },
  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop:     14,
    marginBottom:  8,
  },
})