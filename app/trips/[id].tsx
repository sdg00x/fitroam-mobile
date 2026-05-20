import React, { useState, useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { Trip, TripLeg } from '../../src/components/TripCard'

const API_BASE = 'http://192.168.0.64:3000'

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function daysBetween(arriveIso: string, departIso: string): number {
  const a = new Date(arriveIso)
  const d = new Date(departIso)
  return Math.round((d.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()

  const [trip,        setTrip]       = useState<Trip | null>(null)
  const [loading,     setLoading]    = useState(true)
  const [error,       setError]      = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [nameDraft,   setNameDraft]  = useState('')
  const [saving,      setSaving]     = useState(false)

  const fetchTrip = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`${API_BASE}/api/trips/${id}`, {
        headers: { 'x-user-id': 'seed_user_placeholder' },
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      setTrip(data.trip)
      setNameDraft(data.trip.name)
    } catch (err) {
      setError('Could not load trip.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useFocusEffect(useCallback(() => { fetchTrip() }, [fetchTrip]))

  async function saveName() {
    if (!trip || !nameDraft.trim() || nameDraft === trip.name) {
      setEditingName(false)
      setNameDraft(trip?.name ?? '')
      return
    }
    try {
      setSaving(true)
      const res = await fetch(`${API_BASE}/api/trips/${id}`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id':    'seed_user_placeholder',
        },
        body: JSON.stringify({ name: nameDraft.trim() }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTrip(data.trip)
      setEditingName(false)
    } catch {
      Alert.alert('Could not save', 'Try again.')
    } finally {
      setSaving(false)
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Delete trip?',
      'This removes the trip and any gyms you saved to it. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ],
    )
  }

  async function doDelete() {
    try {
      const res = await fetch(`${API_BASE}/api/trips/${id}`, {
        method:  'DELETE',
        headers: { 'x-user-id': 'seed_user_placeholder' },
      })
      if (!res.ok) throw new Error()
      router.back()
    } catch {
      Alert.alert('Could not delete', 'Try again.')
    }
  }

  function planLeg(_leg: TripLeg) {
    // Step 8 lands here — Explore opens with viewingLocation set to this leg.
    Alert.alert('Coming soon', 'Planning mode in Explore is the next step.')
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centred}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    )
  }

  if (error || !trip) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={{ width: 26 }} />
        </View>
        <View style={styles.centred}>
          <Text style={{ color: colors.error, fontSize: 13 }}>
            {error || 'Trip not found'}
          </Text>
          <TouchableOpacity onPress={fetchTrip} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.accent, fontWeight: '700' }}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const firstLeg  = trip.legs[0]
  const lastLeg   = trip.legs[trip.legs.length - 1]
  const dateRange = firstLeg && lastLeg
    ? `${formatDateLong(firstLeg.arriveOn)} – ${formatDateLong(lastLeg.departOn)}`
    : ''
  const totalNights = firstLeg && lastLeg
    ? daysBetween(firstLeg.arriveOn, lastLeg.departOn)
    : 0
  const totalGyms = trip.tripGyms.length

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={confirmDelete} hitSlop={12}>
          <Ionicons name="trash-outline" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Trip name + reason */}
        <View style={{ marginTop: 8, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => setEditingName(true)} activeOpacity={0.7}>
            <Text style={{
              fontSize:      30,
              fontWeight:    '800',
              color:         colors.textPrimary,
              letterSpacing: -1,
            }}>
              {trip.name}
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
            {dateRange}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
            {totalNights} night{totalNights === 1 ? '' : 's'} · {trip.legs.length} leg{trip.legs.length === 1 ? '' : 's'}
            {totalGyms > 0 ? ` · ${totalGyms} gym${totalGyms === 1 ? '' : 's'} saved` : ''}
          </Text>
          {trip.reason && (
            <View style={{ flexDirection: 'row', marginTop: 12 }}>
              <View style={[styles.reasonPill, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                <Text style={{
                  fontSize:      10,
                  fontWeight:    '800',
                  color:         colors.textSecondary,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                  {trip.reason}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Legs */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: 24 }]}>
          ITINERARY
        </Text>

        {trip.legs.map((leg, i) => {
          const gymsInLeg  = trip.tripGyms.filter(tg => tg.legId === leg.id)
          const legNights  = daysBetween(leg.arriveOn, leg.departOn)
          return (
            <View key={leg.id} style={[styles.legCard, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    radius.card,
            }]}>
              {/* Leg header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <View style={[styles.legNumberPill, { backgroundColor: colors.accent }]}>
                  <Text style={{
                    fontSize:      11,
                    fontWeight:    '800',
                    color:         colors.accentText,
                    letterSpacing: 0.5,
                  }}>
                    LEG {i + 1}
                  </Text>
                </View>
                <Text style={{
                  fontSize:   12,
                  color:      colors.textMuted,
                  marginLeft: 10,
                }}>
                  {legNights} night{legNights === 1 ? '' : 's'}
                </Text>
              </View>

              <Text style={{
                fontSize:      22,
                fontWeight:    '800',
                color:         colors.textPrimary,
                marginTop:     8,
                letterSpacing: -0.5,
              }}>
                {leg.city}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
                {formatDateShort(leg.arriveOn)} – {formatDateShort(leg.departOn)}
              </Text>

              {/* Gyms for this leg */}
              {gymsInLeg.length > 0 ? (
                <View style={{ marginTop: 14 }}>
                  {gymsInLeg.map(tg => (
                    <View key={tg.id} style={[styles.gymRow, { borderTopColor: colors.border }]}>
                      <Ionicons name="barbell-outline" size={16} color={colors.textSecondary} />
                      <Text style={{
                        fontSize:   13,
                        color:      colors.textPrimary,
                        fontWeight: '600',
                        marginLeft: 8,
                        flex:       1,
                      }}>
                        {tg.gym.name}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={{
                  fontSize:  12,
                  color:     colors.textMuted,
                  marginTop: 14,
                  fontStyle: 'italic',
                }}>
                  No gyms saved for this leg yet
                </Text>
              )}

              {/* Plan this leg CTA */}
              <TouchableOpacity
                onPress={() => planLeg(leg)}
                activeOpacity={0.8}
                style={[styles.planBtn, { borderColor: colors.accent }]}
              >
                <Text style={{
                  fontSize:      12,
                  fontWeight:    '800',
                  color:         colors.accent,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                  Plan this leg →
                </Text>
              </TouchableOpacity>
            </View>
          )
        })}
      </ScrollView>

      {/* Name editor modal */}
      <Modal
        visible={editingName}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingName(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, {
            backgroundColor: colors.background,
            borderColor:     colors.border,
          }]}>
            <Text style={{
              fontSize:   13,
              fontWeight: '800',
              color:      colors.textMuted,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Trip name
            </Text>
            <TextInput
              value={nameDraft}
              onChangeText={setNameDraft}
              autoFocus
              placeholderTextColor={colors.textMuted}
              style={{
                fontSize:        17,
                fontWeight:      '700',
                color:           colors.textPrimary,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                paddingVertical:   8,
              }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 16, marginTop: 20 }}>
              <TouchableOpacity onPress={() => { setEditingName(false); setNameDraft(trip.name) }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveName} disabled={saving}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.accent }}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 12,
  },
  centred: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom:  10,
  },
  reasonPill: {
    paddingHorizontal: 10,
    paddingVertical:    4,
    borderRadius:       100,
    borderWidth:        1,
  },
  legCard: {
    borderWidth:  1,
    padding:      18,
    marginBottom: 12,
  },
  legNumberPill: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderRadius:      6,
  },
  gymRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  planBtn: {
    marginTop:       14,
    paddingVertical: 12,
    alignItems:      'center',
    borderRadius:    100,
    borderWidth:     1,
  },
  modalBackdrop: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 16,
    borderWidth:  1,
    padding:      20,
  },
})
