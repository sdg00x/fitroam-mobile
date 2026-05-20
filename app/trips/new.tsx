import React, { useState, useMemo } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, ActivityIndicator, Modal, FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { UK_CITIES, City } from '../../src/lib/cities'

const API_BASE = 'http://192.168.0.64:3000'

interface LegDraft {
  city:      City | null
  arriveOn:  string  // ISO date string YYYY-MM-DD
  departOn:  string
}

const REASONS = [
  { key: 'leisure', label: 'Leisure' },
  { key: 'work',    label: 'Work'    },
  { key: 'nomad',   label: 'Nomad'   },
]

export default function NewTripScreen() {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()

  const [name,        setName]        = useState('')
  const [reason,      setReason]      = useState<string | null>(null)
  const [legs,        setLegs]        = useState<LegDraft[]>([
    { city: null, arriveOn: '', departOn: '' },
  ])
  const [submitting,  setSubmitting]  = useState(false)
  const [cityPickerForLeg, setCityPickerForLeg] = useState<number | null>(null)

  // Auto-suggest name from legs
  const suggestedName = useMemo(() => {
    const filled = legs.filter(l => l.city).map(l => l.city!.name)
    if (filled.length === 0) return ''
    if (filled.length === 1) return `${filled[0]} trip`
    return filled.join(' + ')
  }, [legs])

  const effectiveName = name.trim() || suggestedName

  function updateLeg(i: number, patch: Partial<LegDraft>) {
    setLegs(prev => prev.map((l, idx) => idx === i ? { ...l, ...patch } : l))
  }

  function addLeg() {
    setLegs(prev => [...prev, { city: null, arriveOn: '', departOn: '' }])
  }

  function removeLeg(i: number) {
    if (legs.length === 1) return
    setLegs(prev => prev.filter((_, idx) => idx !== i))
  }

  function isValidDate(s: string) {
    // Expect YYYY-MM-DD
    return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s).getTime())
  }

  async function handleCreate() {
    // Validate
    if (!effectiveName) {
      Alert.alert('Missing name', 'Add a trip name or select at least one city.')
      return
    }
    for (let i = 0; i < legs.length; i++) {
      const l = legs[i]
      if (!l.city) {
        Alert.alert('Missing city', `Pick a city for leg ${i + 1}.`)
        return
      }
      if (!isValidDate(l.arriveOn) || !isValidDate(l.departOn)) {
        Alert.alert('Dates needed', `Leg ${i + 1} needs valid dates in YYYY-MM-DD format.`)
        return
      }
      if (new Date(l.departOn) < new Date(l.arriveOn)) {
        Alert.alert('Date order', `Leg ${i + 1}: depart date is before arrive date.`)
        return
      }
    }

    try {
      setSubmitting(true)
      const res = await fetch(`${API_BASE}/api/trips`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id':    'seed_user_placeholder',
        },
        body: JSON.stringify({
          name:   effectiveName,
          reason: reason ?? undefined,
          legs:   legs.map(l => ({
            city:     l.city!.name,
            citySlug: l.city!.slug,
            country:  l.city!.country,
            lat:      l.city!.lat,
            lng:      l.city!.lng,
            arriveOn: l.arriveOn,
            departOn: l.departOn,
          })),
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `API ${res.status}`)
      }

      // Success — go back to Trips tab
      router.back()
    } catch (err: any) {
      Alert.alert('Could not create trip', err.message || 'Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{
          fontSize:   17,
          fontWeight: '700',
          color:      colors.textPrimary,
        }}>
          New trip
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Trip name */}
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

        {/* Reason */}
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

        {/* Legs */}
        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>LEGS</Text>
        {legs.map((leg, i) => (
          <View key={i} style={[styles.legCard, {
            backgroundColor: colors.surface,
            borderColor:     colors.border,
            borderRadius:    radius.card,
          }]}>
            <View style={styles.legHeader}>
              <Text style={{
                fontSize:   11,
                fontWeight: '800',
                color:      colors.accent,
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

            {/* City picker */}
            <TouchableOpacity
              onPress={() => setCityPickerForLeg(i)}
              activeOpacity={0.7}
              style={[styles.cityPickerBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="location-outline" size={18} color={colors.textMuted} />
              <Text style={{
                fontSize:   15,
                fontWeight: '600',
                color:      leg.city ? colors.textPrimary : colors.textMuted,
                marginLeft: 8,
                flex:       1,
              }}>
                {leg.city ? leg.city.name : 'Pick a city'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Dates */}
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

      {/* Footer CTA */}
      <View style={[styles.footer, {
        backgroundColor: colors.background,
        borderTopColor:  colors.border,
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

      {/* City picker modal */}
      <Modal
        visible={cityPickerForLeg !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setCityPickerForLeg(null)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{
            backgroundColor:    colors.background,
            borderTopLeftRadius:  24,
            borderTopRightRadius: 24,
            paddingTop:         8,
            paddingBottom:      32,
            maxHeight:          '70%',
          }}>
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.screen, paddingBottom: 12 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
                Pick a city
              </Text>
              <TouchableOpacity onPress={() => setCityPickerForLeg(null)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={UK_CITIES}
              keyExtractor={c => c.slug}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (cityPickerForLeg !== null) {
                      updateLeg(cityPickerForLeg, { city: item })
                    }
                    setCityPickerForLeg(null)
                  }}
                  style={{
                    paddingHorizontal: spacing.screen,
                    paddingVertical:   14,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                    {item.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                    {item.country}
                  </Text>
                </TouchableOpacity>
              )}
            />
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
    fontSize:        15,
    fontWeight:      '600',
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
  cityPickerBtn: {
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
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'center',
    paddingVertical:   12,
    borderWidth:       1,
    borderStyle:       'dashed',
    borderRadius:      10,
    marginTop:         4,
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
