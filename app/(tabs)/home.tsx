import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'
import { useUser } from '../../src/hooks/useUser'
import { useViewingLocation } from '../../src/hooks/useViewingLocation'
import { useWeather, weatherIconFor, greetingFor } from '../../src/hooks/useWeather'
import { useNextTrip } from '../../src/hooks/useNextTrip'
import { useTopMatch } from '../../src/hooks/useTopMatch'
import { useStats } from '../../src/hooks/useStats'
import { computeDailyTraining } from '../../src/lib/training'
import { useTodaySession } from '../../src/hooks/useTodaySession'
import { TodaySessionPicker } from '../../src/components/TodaySessionPicker'

function formatEquipmentTag(tag: string): string {
  return tag
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}

export default function HomeScreen() {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()
  const { profile } = useProfile()
  const { user } = useUser()
  const { location: viewingLoc } = useViewingLocation()
  const lat = viewingLoc?.lat ?? null
  const lng = viewingLoc?.lng ?? null

  const { weather, loading: weatherLoading, error: weatherError } = useWeather(lat, lng)
  const { trip: nextTrip, daysAway, legCount, nightCount, refresh: refreshTrip } = useNextTrip()
  const { gym: topGym, loading: topLoading } = useTopMatch(lat, lng)
  const { sessions, cities, visits, refresh: refreshStats } = useStats()

  // City labels for passport pills
  const visitedCities = useCallback(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const v of visits as any[]) {
      const parts = (v.gymAddress || '').split(',').map((s: string) => s.trim())
      const city = parts.length >= 3 ? parts[parts.length - 3] : (parts[parts.length - 2] || '')
      if (!city) continue
      const key = city.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        out.push(city)
      }
    }
    return out.slice(0, 5)
  }, [visits])

  useFocusEffect(useCallback(() => { refreshStats(); refreshTrip() }, []))

  const greeting = greetingFor()
  const firstName = user?.name ? user.name.split(/\s+/)[0] : null
  const today = computeDailyTraining(profile.trainingPattern)
  const { entry: todayLog, setSession } = useTodaySession()
  const [pickerOpen, setPickerOpen] = useState(false)

  // If user has logged today's session, override the computed values
  const sessionDetails: Record<string, { label: string; description: string; equipment: string[] }> = {
    push: {
      label: "Push day",
      description: "Chest, shoulders, triceps. Bench, dumbbells, cables.",
      equipment: ["free_weights", "dumbbells", "cables"],
    },
    pull: {
      label: "Pull day",
      description: "Back, biceps, rear delts. Bars and cables.",
      equipment: ["pull_up_bars", "cables", "barbells"],
    },
    legs: {
      label: "Legs day",
      description: "Quads, hamstrings, glutes. Rack and leg press.",
      equipment: ["power_rack", "barbells", "free_weights"],
    },
    upper: {
      label: "Upper body",
      description: "Chest, back, shoulders, arms.",
      equipment: ["free_weights", "cables", "dumbbells"],
    },
    lower: {
      label: "Lower body",
      description: "Quads, hamstrings, glutes, calves.",
      equipment: ["free_weights", "barbells", "machines"],
    },
    full_body: {
      label: "Full body",
      description: "Compound lifts, every major group.",
      equipment: ["barbells", "free_weights", "power_rack"],
    },
    rest: {
      label: "Rest day",
      description: "Mobility and recovery today.",
      equipment: [],
    },
  }

  const override         = todayLog ? sessionDetails[todayLog.session] : null
  const displayDayLabel  = override?.label       ?? today.dayLabel
  const displayDesc      = override?.description ?? today.description
  const displayEquipment = override?.equipment   ?? today.equipment

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero — greeting + weather chip */}
        <View style={[styles.hero, { paddingHorizontal: spacing.screen }]}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{greeting}</Text>
            <Text style={[styles.headline, { color: colors.textPrimary }]}>
              {firstName ? `Hey ${firstName}` : 'Welcome back'}
            </Text>
          </View>
          {weather && !weatherError && (
            <View style={[styles.weatherChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons
                name={iconForCondition(weather.condition)}
                size={16}
                color={colors.textSecondary}
              />
              <Text style={{ fontSize: 18, fontWeight: '500', color: colors.textPrimary, marginTop: 2, letterSpacing: -0.4 }}>
                {weather.tempC}°
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>
                {weather.city || viewingLoc?.cityName}
              </Text>
            </View>
          )}
        </View>

        {/* Today's training */}
        <View style={[styles.section, { paddingHorizontal: spacing.screen }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>TODAY'S TRAINING</Text>
          {today.hasPattern ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setPickerOpen(true)}
              style={[styles.trainingCard, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    18,
            }]}>
              <View style={[styles.trainingAccent, { backgroundColor: colors.accent }]} />

              {today.rotation && today.rotationToday != null && (
                <View style={styles.pipRow}>
                  {today.rotation.map((_, i) => (
                    <View
                      key={i}
                      style={{
                        flex:            1,
                        height:          3,
                        borderRadius:    2,
                        backgroundColor: i < (today.rotationToday ?? 0)
                          ? 'rgba(200,255,87,0.35)'
                          : i === today.rotationToday
                          ? colors.accent
                          : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  ))}
                </View>
              )}

              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 6 }}>
                <Text style={{ fontSize: 26, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.5 }}>
                  {displayDayLabel}
                  <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textMuted, marginLeft: 8 }}>
                    {todayLog ? '· tap to change' : '· tap to set'}
                  </Text>
                </Text>
                {today.dayOfCycle && today.cycleLength && !todayLog && (
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.accent, marginLeft: 8, opacity: 0.7 }}>
                    Day {today.dayOfCycle} of {today.cycleLength}
                  </Text>
                )}
              </View>

              <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 14 }}>
                {displayDesc}
              </Text>

              {displayEquipment.length > 0 && (
                <View style={styles.pillRow}>
                  {displayEquipment.map((eq) => (
                    <View key={eq} style={{
                      backgroundColor: 'rgba(200,255,87,0.08)',
                      borderColor:     'rgba(200,255,87,0.22)',
                      borderWidth:     1,
                      borderRadius:    100,
                      paddingVertical:    6,
                      paddingHorizontal: 11,
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent }}>
                        {formatEquipmentTag(eq)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {displayEquipment.length > 0 && (
                <TouchableOpacity
                  onPress={() => router.push({
                    pathname: "/(tabs)",
                    params: {
                      requiredEquipment: displayEquipment.join(","),
                      filterLabel: displayDayLabel,
                    },
                  })}
                  activeOpacity={0.7}
                  style={[styles.trainingCta, { borderTopColor: colors.border }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.accent, letterSpacing: 0.2 }}>
                    Find a {displayDayLabel.toLowerCase()}-friendly gym
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.accent} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/profile/sections/training')}
              activeOpacity={0.85}
              style={[styles.emptyCard, {
                backgroundColor: colors.surface,
                borderColor:     colors.border,
                borderRadius:    16,
              }]}
            >
              <Ionicons name="barbell-outline" size={22} color={colors.textMuted} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                  Set your training pattern
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Get daily prompts for what to train and where.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Next trip */}
        <View style={[styles.section, { paddingHorizontal: spacing.screen }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>NEXT TRIP</Text>
          {nextTrip && daysAway != null ? (
            <TouchableOpacity
              onPress={() => router.push(`/trips/${nextTrip.id}`)}
              activeOpacity={0.85}
              style={[styles.tripCard, {
                backgroundColor: colors.surface,
                borderColor:     colors.border,
                borderRadius:    16,
              }]}
            >
              <View style={[styles.tripIcon, { backgroundColor: 'rgba(200,255,87,0.1)' }]}>
                <Ionicons name="airplane" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: 14, minWidth: 0 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.3 }}
                  numberOfLines={1}
                >
                  {nextTrip.legs[0]?.city || nextTrip.name}
                </Text>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
                  {nightCount} night{nightCount === 1 ? '' : 's'} · {legCount} leg{legCount === 1 ? '' : 's'} planned
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.4, lineHeight: 24 }}>
                  {daysAway === 0 ? 'Today' : daysAway}
                </Text>
                <Text style={{ fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 1, marginTop: 3 }}>
                  {daysAway === 0 ? '' : daysAway === 1 ? 'DAY AWAY' : 'DAYS AWAY'}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/trips/new')}
              activeOpacity={0.85}
              style={[styles.emptyCard, {
                backgroundColor: colors.surface,
                borderColor:     colors.border,
                borderRadius:    16,
              }]}
            >
              <Ionicons name="airplane-outline" size={22} color={colors.textMuted} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                  No trips planned
                </Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                  Plan your first trip across cities.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Top match today */}
        {(topGym || topLoading) && (
          <View style={[styles.section, { paddingHorizontal: spacing.screen }]}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>TOP MATCH TODAY</Text>
            {!topGym && topLoading ? (
              <View style={[styles.gymCard, {
                backgroundColor: colors.surface,
                borderColor:     colors.border,
                borderRadius:    16,
              }]}>
                <View style={[styles.gymImagePlaceholder, { opacity: 0.4 }]} />
                <View style={styles.gymInfoRow}>
                  <View style={{ flex: 1 }}>
                    <View style={{ height: 14, backgroundColor: colors.border, borderRadius: 4, opacity: 0.5, marginBottom: 6, width: "70%" }} />
                    <View style={{ height: 10, backgroundColor: colors.border, borderRadius: 4, opacity: 0.3, width: "50%" }} />
                  </View>
                </View>
              </View>
            ) : topGym ? (
            <TouchableOpacity
              onPress={() => router.push(`/gym/${topGym.id}`)}
              activeOpacity={0.85}
              style={[styles.gymCard, {
                backgroundColor: colors.surface,
                borderColor:     colors.border,
                borderRadius:    16,
              }]}
            >
              <View style={styles.gymImagePlaceholder}>
                {topGym.photoUrls?.[0] && (
                  <Image
                    source={{ uri: topGym.photoUrls[0] }}
                    style={StyleSheet.absoluteFillObject}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.gymImageScrim} />
                <View style={[styles.gymScorePill, { backgroundColor: colors.accent }]}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: colors.accentText, letterSpacing: -0.1 }}>
                    {topGym.matchScore}
                  </Text>
                </View>
                <View style={styles.gymTags}>
                  {topGym.isOpenNow && (
                    <View style={styles.gymTagOverlay}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: '#fff' }}>Open now</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.gymInfoRow}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.2 }}
                    numberOfLines={1}
                  >
                    {topGym.name}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    {topGym.walkTime ? `${topGym.walkTime} min walk` : 'Nearby'} · {topGym.matchReasons?.[0] || 'Strong match'}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent, marginLeft: 10 }}>
                  View →
                </Text>
              </View>
            </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* Fitness passport */}
        <View style={[styles.section, { paddingHorizontal: spacing.screen, marginBottom: 0 }]}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>FITNESS PASSPORT</Text>
          <TouchableOpacity
            onPress={() => router.push('/profile/passport')}
            activeOpacity={0.85}
            style={[styles.passportCard, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    16,
            }]}
          >
            <View style={styles.passportTop}>
              <View>
                <Text style={{ fontSize: 30, fontWeight: '800', color: colors.accent, letterSpacing: -0.8, lineHeight: 30 }}>
                  {cities}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.2, marginTop: 5 }}>
                  {cities === 1 ? 'CITY STAMPED' : 'CITIES STAMPED'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textMuted, marginRight: 4 }}>
                  View all
                </Text>
                <Ionicons name="arrow-forward" size={12} color={colors.textMuted} />
              </View>
            </View>
            {visitedCities().length > 0 ? (
              <View style={styles.passportDots}>
                {visitedCities().map((c, i) => (
                  <View key={`${c}-${i}`} style={[styles.passportPill, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.border }]}>
                    <View style={[styles.passportDot, { backgroundColor: colors.accent }]} />
                    <Text style={{ fontSize: 10, fontWeight: '600', color: colors.textSecondary }}>{c}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
                Train somewhere to start your passport.
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TodaySessionPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(session) => { setSession(session) }}
        current={todayLog?.session}
      />
    </SafeAreaView>
  )
}

// Map OpenWeather condition string → Ionicons name
function iconForCondition(condition: string): any {
  const c = (condition || '').toLowerCase()
  if (c.includes('clear'))   return 'sunny-outline'
  if (c.includes('cloud'))   return 'cloud-outline'
  if (c.includes('rain'))    return 'rainy-outline'
  if (c.includes('thunder')) return 'thunderstorm-outline'
  if (c.includes('snow'))    return 'snow-outline'
  return 'partly-sunny-outline'
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    paddingTop:      18,
    paddingBottom:   24,
  },
  eyebrow: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom:  8,
  },
  headline: {
    fontSize:      28,
    fontWeight:    '800',
    letterSpacing: -0.8,
    lineHeight:    30,
  },
  weatherChip: {
    paddingHorizontal: 12,
    paddingVertical:   10,
    borderWidth:       1,
    borderRadius:      12,
    alignItems:        'center',
    minWidth:          64,
  },
  section: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom:  10,
    paddingLeft:   2,
  },
  trainingCard: {
    borderWidth:     1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    position:        'relative',
    overflow:        'hidden',
  },
  trainingAccent: {
    position: 'absolute',
    top:      0,
    left:     0,
    width:    3,
    height:   '100%',
  },
  pipRow: {
    flexDirection: 'row',
    gap:           4,
    marginBottom:  14,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           6,
    marginBottom:  14,
  },
  trainingCta: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingTop:     12,
    borderTopWidth: 1,
  },
  emptyCard: {
    flexDirection:    'row',
    alignItems:       'center',
    padding:          14,
    borderWidth:      1,
  },
  tripCard: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:       16,
    borderWidth:   1,
  },
  tripIcon: {
    width:           44,
    height:          44,
    borderRadius:    12,
    alignItems:      'center',
    justifyContent:  'center',
  },
  gymCard: {
    borderWidth: 1,
    overflow:    'hidden',
  },
  gymImageScrim: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  gymImagePlaceholder: {
    height:         100,
    backgroundColor: '#1f2a1f',
    position:        'relative',
    padding:         12,
    justifyContent:  'flex-end',
  },
  gymScorePill: {
    position:        'absolute',
    top:             10,
    right:           10,
    paddingHorizontal: 8,
    paddingVertical:    4,
    borderRadius:       8,
  },
  gymTags: {
    flexDirection: 'row',
    gap:           6,
  },
  gymTagOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius:    100,
    paddingHorizontal: 8,
    paddingVertical:   3,
  },
  gymInfoRow: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        14,
  },
  passportCard: {
    borderWidth: 1,
    padding:     18,
  },
  passportTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   14,
  },
  passportDots: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           5,
  },
  passportPill: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              4,
    paddingHorizontal: 9,
    paddingVertical:   4,
    borderRadius:      100,
    borderWidth:       1,
  },
  passportDot: {
    width:        5,
    height:       5,
    borderRadius: 2.5,
  },
})
