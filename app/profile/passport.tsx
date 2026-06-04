import React, { useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet , Alert} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useStats, Visit } from '../../src/hooks/useStats'


// Extract city from address — same logic as useStats
function extractCity(address: string): string {
  if (!address) return 'Unknown'
  const parts = address.split(',').map(s => s.trim())
  if (parts.length >= 3) return parts[parts.length - 3]
  if (parts.length >= 2) return parts[parts.length - 2]
  return parts[0]
}

function extractCountry(address: string): string {
  if (!address) return ''
  const parts = address.split(',').map(s => s.trim())
  return parts[parts.length - 1] || ''
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface CityGroup {
  city:     string
  country:  string
  visits:   Visit[]
  firstVisitAt: string
  lastVisitAt:  string
}

function groupByCity(visits: Visit[]): CityGroup[] {
  const map = new Map<string, CityGroup>()
  for (const v of visits) {
    const city = extractCity(v.gymAddress)
    const country = extractCountry(v.gymAddress)
    const key = `${city}__${country}`
    if (!map.has(key)) {
      map.set(key, {
        city,
        country,
        visits: [],
        firstVisitAt: v.visitedAt,
        lastVisitAt:  v.visitedAt,
      })
    }
    const group = map.get(key)!
    group.visits.push(v)
    if (v.visitedAt < group.firstVisitAt) group.firstVisitAt = v.visitedAt
    if (v.visitedAt > group.lastVisitAt)  group.lastVisitAt  = v.visitedAt
  }
  // Sort city groups by most recent visit
  return Array.from(map.values()).sort(
    (a, b) => b.lastVisitAt.localeCompare(a.lastVisitAt)
  )
}

export default function PassportScreen() {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()
  const { visits, loading, updateStatus, remove } = useStats()

  const cityGroups = useMemo(() => groupByCity(visits as Visit[]), [visits])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
          Fitness passport
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.centred}>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>Loading...</Text>
        </View>
      ) : cityGroups.length === 0 ? (
        <View style={styles.centred}>
          <Ionicons name="airplane-outline" size={36} color={colors.textMuted} />
          <Text style={{
            fontSize:   15,
            fontWeight: '700',
            color:      colors.textPrimary,
            marginTop:  16,
          }}>
            No stamps yet
          </Text>
          <Text style={{
            fontSize:    13,
            color:       colors.textMuted,
            marginTop:   6,
            textAlign:   'center',
            lineHeight:  18,
            maxWidth:    280,
          }}>
            Tap "Get access" on a gym to start your passport. Every place you train adds a stamp.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary banner */}
          <View style={[styles.summary, {
            backgroundColor: colors.surface,
            borderColor:     colors.border,
            borderRadius:    radius.card,
          }]}>
            <Text style={{
              fontSize:      32,
              fontWeight:    '800',
              color:         colors.accent,
              letterSpacing: -1,
            }}>
              {cityGroups.length}
            </Text>
            <Text style={{
              fontSize:      11,
              fontWeight:    '700',
              color:         colors.textMuted,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginTop:     2,
              marginBottom:  14,
            }}>
              {cityGroups.length === 1 ? 'City' : 'Cities'} stamped
            </Text>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 14 }}>
              <SmallStat label="Sessions" value={String(visits.length)} colors={colors} />
              <SmallStat
                label="First stamp"
                value={cityGroups.length > 0
                  ? new Date(cityGroups[cityGroups.length - 1].firstVisitAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                  : '—'}
                colors={colors}
              />
              <SmallStat
                label="Latest"
                value={cityGroups.length > 0
                  ? new Date(cityGroups[0].lastVisitAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
                  : '—'}
                colors={colors}
              />
            </View>
          </View>

          {/* City list */}
          <Text style={{
            fontSize:      11,
            fontWeight:    '700',
            letterSpacing: 1.2,
            color:         colors.textMuted,
            textTransform: 'uppercase',
            marginTop:     28,
            marginBottom:  10,
          }}>
            Visited
          </Text>

          {cityGroups.map((group, gi) => (
            <View key={`${group.city}-${group.country}-${gi}`} style={[styles.cityCard, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    radius.card,
            }]}>
              {/* City header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <View style={[styles.cityDot, { backgroundColor: colors.accent }]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{
                    fontSize:      18,
                    fontWeight:    '800',
                    color:         colors.textPrimary,
                    letterSpacing: -0.3,
                  }}>
                    {group.city}
                  </Text>
                  {!!group.country && (
                    <Text style={{
                      fontSize:  12,
                      color:     colors.textMuted,
                      marginTop: 2,
                    }}>
                      {group.country}
                    </Text>
                  )}
                </View>
                <View style={[styles.countPill, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]}>
                  <Text style={{
                    fontSize:      11,
                    fontWeight:    '800',
                    color:         colors.textSecondary,
                    letterSpacing: 0.3,
                  }}>
                    {group.visits.length} {group.visits.length === 1 ? 'visit' : 'visits'}
                  </Text>
                </View>
              </View>

              {/* Gym list */}
              {group.visits.map((v, vi) => {
                const isPending   = v.status === 'pending'
                const isConfirmed = v.status === 'confirmed'
                return (
                  <TouchableOpacity
                    key={v.id}
                    activeOpacity={0.7}
                    onLongPress={() => {
                      Alert.alert(
                        v.gymName,
                        `Remove this visit from your passport?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Remove', style: 'destructive', onPress: () => remove(v) },
                        ]
                      )
                    }}
                    onPress={() => {
                      Alert.alert(
                        v.gymName,
                        `What do you want to do with this visit?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          ...(isConfirmed ? [] : [{
                            text: 'Mark as confirmed',
                            onPress: () => updateStatus(v, 'confirmed'),
                          } as const]),
                          ...(isPending ? [] : [{
                            text: 'Mark as pending',
                            onPress: () => updateStatus(v, 'pending'),
                          } as const]),
                          {
                            text: 'Remove from passport',
                            style: 'destructive' as const,
                            onPress: () => remove(v),
                          },
                        ]
                      )
                    }}
                    style={{
                      flexDirection:    'row',
                      alignItems:       'flex-start',
                      paddingVertical:  10,
                      borderTopWidth:   vi === 0 ? 0 : 1,
                      borderTopColor:   colors.border,
                    }}
                  >
                    <View style={{ marginTop: 4 }}>
                      <View style={{
                        width: 8, height: 8, borderRadius: 4,
                        backgroundColor: isConfirmed ? colors.accent : isPending ? colors.textMuted : colors.textSecondary,
                      }} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text
                        style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}
                        numberOfLines={1}
                      >
                        {v.gymName}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                        {formatDate(v.visitedAt)}
                        {v.accessType === 'monthly' ? ' · Monthly access' : ' · Day pass'}
                        {isPending ? ' · Tap ✓ to confirm' : ''}
                      </Text>
                    </View>

                    {/* Inline quick actions for pending visits */}
                    {isPending && (
                      <View style={{ flexDirection: 'row', gap: 6, marginLeft: 8 }}>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation()
                            Alert.alert(
                              'Confirm visit',
                              `Mark your visit to ${v.gymName} as confirmed?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Yes, I went', onPress: () => updateStatus(v, 'confirmed') },
                              ]
                            )
                          }}
                          hitSlop={6}
                          style={{
                            width: 30, height: 30, borderRadius: 15,
                            backgroundColor: colors.accent,
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Ionicons name="checkmark" size={16} color={colors.accentText} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation()
                            Alert.alert(
                              "Didn't go?",
                              `Remove this visit to ${v.gymName} from your passport?`,
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Remove', style: 'destructive', onPress: () => updateStatus(v, 'denied') },
                              ]
                            )
                          }}
                          hitSlop={6}
                          style={{
                            width: 30, height: 30, borderRadius: 15,
                            borderWidth: 1, borderColor: colors.border,
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Ionicons name="close" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function SmallStat({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
        {value}
      </Text>
      <Text style={{
        fontSize:      10,
        fontWeight:    '700',
        color:         colors.textMuted,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
        marginTop:     2,
      }}>
        {label}
      </Text>
    </View>
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
  centred: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    paddingBottom:  80,
    paddingHorizontal: 24,
  },
  summary: {
    alignItems:    'center',
    paddingTop:    24,
    paddingBottom: 18,
    paddingHorizontal: 16,
    borderWidth:   1,
    marginTop:     16,
  },
  statDivider: {
    height: 1,
    width:  '100%',
  },
  cityCard: {
    padding:      16,
    borderWidth:  1,
    marginBottom: 10,
  },
  cityDot: {
    width:        10,
    height:       10,
    borderRadius: 5,
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical:    4,
    borderRadius:      100,
    borderWidth:       1,
  },
})
