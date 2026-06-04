import React, { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useUser } from "../../src/hooks/useUser"
import { PlacePicker, PickedPlace } from '../../src/components/PlacePicker'
import { API_BASE } from '../../src/lib/api'


interface LegDraft {
  place:    PickedPlace | null
  arriveOn: string
  departOn: string
}

const REASONS = [
  { key: 'leisure', label: 'Leisure' },
  { key: 'work',    label: 'Work'    },
  { key: 'nomad',   label: 'Nomad'   },
]

export default function NewTripScreen() {
  const { colors, spacing, radius } = useTheme()
  const { user } = useUser()
  const router = useRouter()

  const [name,       setName]       = useState('')
  const [reason,     setReason]     = useState<string | null>(null)
  const [legs,       setLegs]       = useState<LegDraft[]>([
    { place: null, arriveOn: '', departOn: '' },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [pickerForLeg, setPickerForLeg] = useState<number | null>(null)

  const suggestedName = useMemo(() => {
    const filled = legs.filter(l => l.place).map(l => l.place!.city || l.place!.name)
    if (filled.length === 0) return ''
    if (filled.length === 1) return `${filled[0]} trip`
    return filled.join(' + ')
  }, [legs])

  const effectiveName = name.trim() || suggestedName

  function updateLeg(i: number, patch: Partial<LegDraft>) {
    setLegs(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l))
  }

  function addLeg() {
    setLegs(prev => [...prev, { place: null, arriveOn: '', departOn: '' }])
  }

  function removeLeg(i: number) {
    if (legs.length === 1) return
    setLegs(prev => prev.filter((_, idx) => idx !== i))
  }

  function isValidDate(s: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime())
  }

  async function handleCreate() {
    if (!effectiveName) {
      Alert.alert('Missing name', 'Add a trip name or pick a destination first.')
      return
    }
    for (let i = 0; i < legs.length; i++) {
      const l = legs[i]
      if (!l.place) {
        Alert.alert('Missing destination', `Pick a destination for leg ${i + 1}.`)
        return
      }
      if (!isValidDate(l.arriveOn) || !isValidDate(l.departOn)) {
        Alert.alert('Dates needed', `Leg ${i + 1} needs valid dates in YYYY-MM-DD.`)
        return
      }
      if (new Date(l.departOn) < new Date(l.arriveOn)) {
        Alert.alert('Date order', `Leg ${i + 1}: depart is before arrive.`)
        return
      }
    }

    try {
      setSubmitting(true)
      const res = await fetch(`${API_BASE}/api/trips`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'seed_user_placeholder',
        },
        body: JSON.stringify({
          name:   effectiveName,
          reason: reason ?? undefined,
          legs:   legs.map(l => ({
            city:             l.place!.city,
            citySlug:         l.place!.citySlug,
            country:          l.place!.country,
            placeId:          l.place!.placeId,
            formattedAddress: l.place!.formattedAddress,
            lat:              l.place!.lat,
            lng:              l.place!.lng,
            arriveOn:         l.arriveOn,
            departOn:         l.departOn,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API ${res.status}`)
      }

      router.back()
    } catch (err: any) {
      Alert.alert('Could not create trip', err.message || 'Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
          New trip
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.eyebrow, { color: colors.textMuted, marginTop: 16 }]}>TRIP NAME</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={suggestedName || 'e.g. Summer roadtrip'}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, {
            color:           colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor:     colors.border,
            borderRadius:    radius.row,
          }]}
        />

        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>REASON (OPTIONAL)</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          {REASONS.map(r => (
            <TouchableOpacity
              key={r.key}
              onPress={() => setReason(reason === r.key ? null : r.key)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 14,
                paddingVertical:    8,
                borderRadius:       100,
                borderWidth:        1,
                borderColor:        reason === r.key ? colors.accent : colors.border,
                backgroundColor:    reason === r.key ? colors.accent : 'transparent',
              }}
            >
              <Text style={{
                fontSize:   12,
                fontWeight: '700',
                color:      reason === r.key ? colors.accentText : colors.textSecondary,
              }}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>LEGS</Text>
        {legs.map((leg, i) => (
          <View key={i} style={[styles.legCard, {
            backgroundColor: colors.surface,
            borderColor:     colors.border,
            borderRadius:    radius.card,
          }]}>
            <View style={styles.legHeader}>
              <Text style={{
                fontSize:      11,
                fontWeight:    '800',
                color:         colors.accent,
                letterSpacing: 1,
              }}>
                LEG {i + 1}
              </Text>
              {legs.length > 1 && (
                <TouchableOpacity onPress={() => removeLeg(i)} hitSlop={8}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setPickerForLeg(i)}
              activeOpacity={0.7}
              style={[styles.pickerBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="location-outline" size={18} color={colors.textMuted} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                {leg.place ? (
                  <>
                    <Text
                      style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary }}
                      numberOfLines={1}
                    >
                      {leg.place.name}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}
                      numberOfLines={1}
                    >
                      {leg.place.formattedAddress}
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textMuted }}>
                    Pick a destination
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>ARRIVE</Text>
                <TextInput
                  value={leg.arriveOn}
                  onChangeText={v => updateLeg(i, { arriveOn: v })}
                  placeholder="2026-06-01"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.dateInput, {
                    color:           colors.textPrimary,
                    backgroundColor: colors.surfaceRaised,
                    borderColor:     colors.border,
                  }]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.dateLabel, { color: colors.textMuted }]}>DEPART</Text>
                <TextInput
                  value={leg.departOn}
                  onChangeText={v => updateLeg(i, { departOn: v })}
                  placeholder="2026-06-04"
                  placeholderTextColor={colors.textMuted}
                  style={[styles.dateInput, {
                    color:           colors.textPrimary,
                    backgroundColor: colors.surfaceRaised,
                    borderColor:     colors.border,
                  }]}
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={addLeg}
          activeOpacity={0.7}
          style={[styles.addLegBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="add" size={18} color={colors.textSecondary} />
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 6, fontWeight: '700' }}>
            Add another leg
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, {
        backgroundColor:  colors.background,
        borderTopColor:   colors.border,
        paddingHorizontal: spacing.screen,
      }]}>
        <TouchableOpacity
          onPress={handleCreate}
          activeOpacity={0.85}
          disabled={submitting}
          style={[styles.createBtn, {
            backgroundColor: submitting ? colors.surface : colors.accent,
            borderRadius:    radius.btn,
          }]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={{
              fontSize:      14,
              fontWeight:    '800',
              color:         colors.accentText,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              Create trip
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <PlacePicker
        visible={pickerForLeg !== null}
        onClose={() => setPickerForLeg(null)}
        onPick={(place) => {
          if (pickerForLeg !== null) {
            updateLeg(pickerForLeg, { place })
          }
          setPickerForLeg(null)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  eyebrow: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop:     20,
    marginBottom:  8,
  },
  input: {
    fontSize:          15,
    fontWeight:        '600',
    paddingHorizontal: 14,
    paddingVertical:   12,
    borderWidth:       1,
  },
  legCard: {
    borderWidth:  1,
    padding:      14,
    marginBottom: 10,
  },
  legHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   10,
  },
  pickerBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: 12,
    paddingVertical:   12,
    borderRadius:      10,
    borderWidth:       1,
  },
  dateLabel: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1,
    marginBottom:  6,
  },
  dateInput: {
    fontSize:          14,
    fontWeight:        '600',
    paddingHorizontal: 12,
    paddingVertical:   10,
    borderWidth:       1,
    borderRadius:      8,
  },
  addLegBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'center',
    paddingVertical:  12,
    borderWidth:      1,
    borderStyle:      'dashed',
    borderRadius:     10,
    marginTop:        4,
  },
  footer: {
    borderTopWidth:  1,
    paddingVertical: 14,
  },
  createBtn: {
    paddingVertical: 16,
    alignItems:      'center',
    justifyContent:  'center',
  },
})
