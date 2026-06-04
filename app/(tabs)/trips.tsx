import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import { useTheme } from '../../src/theme/useTheme'
import { useUser } from "../../src/hooks/useUser"
import { TripCard, Trip } from '../../src/components/TripCard'
import { API_BASE } from '../../src/lib/api'


interface CategorizedTrips {
  nextUp:   Trip | null
  upcoming: Trip[]
  past:     Trip[]
}

function categorizeTrips(trips: Trip[]): CategorizedTrips {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming: Trip[] = []
  const past:     Trip[] = []

  for (const trip of trips) {
    const lastLeg = trip.legs[trip.legs.length - 1]
    if (!lastLeg) {
      // Trip with no legs — treat as past edge case
      past.push(trip)
      continue
    }
    const lastDepart = new Date(lastLeg.departOn)
    lastDepart.setHours(0, 0, 0, 0)
    if (lastDepart >= today) {
      upcoming.push(trip)
    } else {
      past.push(trip)
    }
  }

  // Sort upcoming by first leg arrive date (soonest first)
  upcoming.sort((a, b) => {
    const aArrive = new Date(a.legs[0]?.arriveOn ?? 0).getTime()
    const bArrive = new Date(b.legs[0]?.arriveOn ?? 0).getTime()
    return aArrive - bArrive
  })

  // Sort past by last depart (most recent first)
  past.sort((a, b) => {
    const aDepart = new Date(a.legs[a.legs.length - 1]?.departOn ?? 0).getTime()
    const bDepart = new Date(b.legs[b.legs.length - 1]?.departOn ?? 0).getTime()
    return bDepart - aDepart
  })

  const [nextUp, ...restUpcoming] = upcoming

  return {
    nextUp:   nextUp ?? null,
    upcoming: restUpcoming,
    past,
  }
}

export default function TripsScreen() {
  const { colors, spacing } = useTheme()
  const { user } = useUser()
  const router = useRouter()

  const [trips,      setTrips]      = useState<Trip[]>([])
  const [loading,    setLoading]    = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const fetchTrips = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API_BASE}/api/trips`, {
        headers: { "x-user-id": user?.id || "seed_user_placeholder" },
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      setTrips(data.trips || [])
    } catch (err) {
      setError('Could not load trips. Is the API running?')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Refetch whenever the tab gains focus (e.g. coming back from Add Trip)
  useFocusEffect(
    useCallback(() => {
      fetchTrips()
    }, [fetchTrips])
  )

  function handleTripPress(trip: Trip) {
    router.push(`/trips/${trip.id}`)
  }

  const { nextUp, upcoming, past } = categorizeTrips(trips)
  const hasAnyTrips = trips.length > 0

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <Text style={{
          fontSize:      32,
          fontWeight:    '800',
          color:         colors.textPrimary,
          letterSpacing: -1,
        }}>
          My trips
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/trips/new')}
          activeOpacity={0.8}
          style={{
            backgroundColor:   colors.accent,
            paddingHorizontal: 14,
            paddingVertical:    8,
            borderRadius:      100,
          }}
        >
          <Text style={{
            fontSize:      11,
            fontWeight:    '800',
            color:         colors.accentText,
            letterSpacing: 0.5,
          }}>
            + ADD TRIP
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error ? (
        <View style={styles.centred}>
          <Text style={{ color: colors.error, fontSize: 13, textAlign: 'center', paddingHorizontal: 32 }}>
            {error}
          </Text>
          <TouchableOpacity onPress={fetchTrips} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : !hasAnyTrips ? (
        <View style={styles.centred}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 }}>
            No trips planned yet
          </Text>
          <Text style={{
            fontSize:          13,
            color:             colors.textMuted,
            textAlign:         'center',
            paddingHorizontal: 32,
            marginBottom:      20,
          }}>
            Plan your training across cities. Multi-leg trips, saved gyms per city, smart pricing across the whole journey.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/trips/new')}
            activeOpacity={0.85}
            style={{
              backgroundColor:   colors.accent,
              paddingHorizontal: 20,
              paddingVertical:   12,
              borderRadius:      100,
            }}
          >
            <Text style={{
              fontSize:      13,
              fontWeight:    '800',
              color:         colors.accentText,
              letterSpacing: 0.5,
            }}>
              PLAN YOUR FIRST TRIP
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.screen,
            paddingBottom:     40,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchTrips() }}
              tintColor={colors.accent}
            />
          }
        >
          {nextUp && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                Next up
              </Text>
              <TripCard
                trip={nextUp}
                variant="hero"
                status="next-up"
                onPress={handleTripPress}
              />
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                Upcoming
              </Text>
              {upcoming.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  variant="compact"
                  status="upcoming"
                  onPress={handleTripPress}
                />
              ))}
            </>
          )}

          {past.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                Past
              </Text>
              {past.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  variant="compact"
                  status="past"
                  onPress={handleTripPress}
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
  safe: { flex: 1 },
  header: {
    paddingTop:      20,
    paddingBottom:   16,
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  centred: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingBottom:  80,
  },
  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop:     14,
    marginBottom:  8,
  },
})
