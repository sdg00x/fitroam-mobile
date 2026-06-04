import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'

export interface TripLeg {
  id:       string
  city:     string
  citySlug: string
  country:  string | null
  lat:      number
  lng:      number
  arriveOn: string
  departOn: string
  legOrder: number
}

export interface Trip {
  id:        string
  name:      string
  reason:    string | null
  createdAt: string
  updatedAt: string
  legs:      TripLeg[]
  tripGyms:  Array<{
    id: string
    gymId: string
    legId: string | null
    matchScore: number
    notes: string | null
    gym: {
      id: string
      name: string
      address: string | null
      lat: number
      lng: number
      dayPass: boolean
      dayPassPence: number | null
      dayPassUrl: string | null
      photoUrls: string[]
      equipmentTags: string[]
      verified: boolean
      citySlug: string | null
      rating: number | null
    }
  }>
}

interface Props {
  trip:     Trip
  variant?: 'hero' | 'compact'
  status:   'next-up' | 'upcoming' | 'past'
  onPress:  (trip: Trip) => void
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function daysUntil(iso: string): number {
  const today    = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(iso)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function TripCard({ trip, variant = 'compact', status, onPress }: Props) {
  const { colors, spacing, radius } = useTheme()

  const firstLeg   = trip.legs[0]
  const lastLeg    = trip.legs[trip.legs.length - 1]
  if (!firstLeg || !lastLeg) return null

  const cityList   = trip.legs.map(l => l.city).join(' → ')
  const dateRange  = `${formatDateShort(firstLeg.arriveOn)} – ${formatDateShort(lastLeg.departOn)}`
  const legCount   = trip.legs.length
  const gymCount   = trip.tripGyms.length

  if (variant === 'hero') {
    const days = daysUntil(firstLeg.arriveOn)
    const pill = days <= 0
      ? 'TRIP ACTIVE'
      : days === 1
      ? 'DEPARTS TOMORROW'
      : `DEPARTS IN ${days} DAYS`

    return (
      <TouchableOpacity
        onPress={() => onPress(trip)}
        activeOpacity={0.85}
        style={[styles.hero, {
          backgroundColor: colors.surface,
          borderColor:     colors.border,
          borderRadius:    radius.card,
          padding:         spacing.card + 4,
        }]}
      >
        <View style={[styles.heroPill, { backgroundColor: colors.accent }]}>
          <Text style={{
            fontSize:      10,
            fontWeight:    '800',
            color:         colors.accentText,
            letterSpacing: 1,
          }}>
            {pill}
          </Text>
        </View>

        <Text style={{
          fontSize:      22,
          fontWeight:    '800',
          color:         colors.textPrimary,
          letterSpacing: -0.5,
          marginTop:     12,
        }}>
          {trip.name}
        </Text>

        <Text style={{
          fontSize:  13,
          color:     colors.textMuted,
          marginTop: 4,
        }}>
          {dateRange} · {legCount} {legCount === 1 ? 'leg' : 'legs'}
        </Text>

        {/* Legs list */}
        <View style={{ marginTop: 14, marginBottom: 4 }}>
          {trip.legs.map((leg, i) => {
            const gymsInLeg = trip.tripGyms.filter(tg => tg.legId === leg.id).length
            return (
              <View key={leg.id} style={styles.legRow}>
                <View style={[styles.legDot, { backgroundColor: colors.accent }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                    {leg.city}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 1 }}>
                    {formatDateShort(leg.arriveOn)} – {formatDateShort(leg.departOn)}
                    {gymsInLeg > 0 ? ` · ${gymsInLeg} gym${gymsInLeg === 1 ? '' : 's'} saved` : ''}
                  </Text>
                </View>
                {i < trip.legs.length - 1 && (
                  <View style={[styles.legLine, { backgroundColor: colors.border }]} />
                )}
              </View>
            )
          })}
        </View>

        <View style={[styles.heroCta, { borderTopColor: colors.border }]}>
          <Text style={{
            fontSize:      11,
            fontWeight:    '800',
            color:         colors.accent,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
            Open full plan →
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  // Compact variant
  return (
    <TouchableOpacity
      onPress={() => onPress(trip)}
      activeOpacity={0.8}
      style={[styles.compact, {
        backgroundColor: colors.surface,
        borderColor:     colors.border,
        borderRadius:    radius.row,
        padding:         spacing.card,
      }]}
    >
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text
          style={{
            fontSize:   14,
            fontWeight: '700',
            color:      colors.textPrimary,
          }}
          numberOfLines={1}
        >
          {trip.name}
        </Text>
        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
          {dateRange} · {legCount} {legCount === 1 ? 'leg' : 'legs'}
          {gymCount > 0 ? ` · ${gymCount} gym${gymCount === 1 ? '' : 's'}` : ''}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.textMuted}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  hero: {
    borderWidth:  1,
    marginBottom: 12,
  },
  heroPill: {
    alignSelf:         'flex-start',
    paddingHorizontal: 10,
    paddingVertical:    4,
    borderRadius:       100,
  },
  legRow: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingVertical: 6,
    position:      'relative',
  },
  legDot: {
    width:        8,
    height:       8,
    borderRadius: 4,
    marginRight:  12,
  },
  legLine: {
    position:    'absolute',
    left:        3,
    top:         18,
    width:       2,
    height:      14,
  },
  heroCta: {
    borderTopWidth: 1,
    marginTop:      12,
    paddingTop:     12,
  },
  compact: {
    flexDirection: 'row',
    alignItems:    'center',
    borderWidth:   1,
    marginBottom:  8,
  },
})
