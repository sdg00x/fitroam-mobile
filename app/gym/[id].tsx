import React, { useState } from 'react'
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, Image, Modal,
  Linking, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'

const API_BASE = 'http://192.168.0.64:3000'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']


function formatHours(openingHours: any): { day: string; hours: string }[] {
  if (!openingHours?.periods) return []
  return DAYS.map((day, i) => {
    const period = openingHours.periods.find((p: any) => p.open?.day === i)
    if (!period) return { day, hours: 'Closed' }
    const open  = `${String(period.open.hour).padStart(2,'0')}:${String(period.open.minute).padStart(2,'0')}`
    const close = period.close
      ? `${String(period.close.hour).padStart(2,'0')}:${String(period.close.minute).padStart(2,'0')}`
      : 'Midnight'
    return { day, hours: `${open} – ${close}` }
  })
}

function openMaps(address: string) {
  const encoded = encodeURIComponent(address)
  const url = Platform.OS === 'ios'
    ? `maps://maps.apple.com/?q=${encoded}`
    : `https://maps.google.com/?q=${encoded}`
  Linking.openURL(url)
}

// ─── Smart pricing engine ────────────────────────────────────────────────────

interface PricingRecommendation {
  recommendMonthly:  boolean
  savingPence:       number
  savingPercent:     number
  daysMessage:       string
  headline:          string
  subline:           string
}

function getPricingRecommendation(
  days:            number,
  dayPassPence:    number | null,
  monthlyPence:    number | null,
): PricingRecommendation | null {
  if (!dayPassPence && !monthlyPence) return null

  const dayPassTotal = dayPassPence ? dayPassPence * days : null
  const monthly      = monthlyPence ?? null

  // If only one option exists
  if (!dayPassTotal) return null
  if (!monthly) return null

  const saving        = dayPassTotal - monthly
  const savingPercent = Math.round((saving / dayPassTotal) * 100)
  const recommendMonthly = saving > 0

  if (recommendMonthly) {
    return {
      recommendMonthly: true,
      savingPence:      saving,
      savingPercent,
      daysMessage:      `${days} day pass${days > 1 ? 'es' : ''} = £${(dayPassTotal/100).toFixed(0)}`,
      headline:         `Monthly saves you £${(saving/100).toFixed(0)}`,
      subline:          `You'd spend £${(dayPassTotal/100).toFixed(0)} on ${days} day passes. A monthly membership is £${(monthly/100).toFixed(0)} — giving you up to 30 days access for less.`,
    }
  }

  return {
    recommendMonthly: false,
    savingPence:      0,
    savingPercent:    0,
    daysMessage:      '',
    headline:         `Day pass is the better deal`,
    subline:          `For ${days} days, ${days} day pass${days > 1 ? 'es' : ''} at £${(dayPassPence!/100).toFixed(0)}/day costs £${(dayPassTotal/100).toFixed(0)} — cheaper than the £${(monthly/100).toFixed(0)} monthly.`,
  }
}

export default function GymDetailScreen() {
  const {
    id, name, address, distanceMinutes, matchScore,
    priceDisplay, priceSubDisplay, equipmentTags,
    matchReasons, openNow, rating, ratingCount,
    dayPassPence, monthlyPence, openingHoursJson, photoUrls, reviews,
  } = useLocalSearchParams<{
    id:               string
    name:             string
    address:          string
    distanceMinutes:  string
    matchScore:       string
    priceDisplay:     string
    priceSubDisplay:  string
    equipmentTags:    string
    matchReasons:     string
    openNow:          string
    rating:           string
    ratingCount:      string
    dayPassPence:     string
    monthlyPence:     string
    openingHoursJson: string
  }>()
  
  const photos     = photoUrls ? JSON.parse(photoUrls) : []
  const gymReviews = reviews   ? JSON.parse(reviews)   : []
  const { colors, spacing, radius } = useTheme()
  const router  = useRouter()

  const [showPassport, setShowPassport] = useState(false)
  const [days,         setDays]         = useState(1)
  const [accessType,   setAccessType]   = useState<'day_pass' | 'monthly'>('day_pass')
  const [saving,       setSaving]       = useState(false)
  const [saved,        setSaved]        = useState(false)
  const [showHours,    setShowHours]    = useState(false)

  const tags         = equipmentTags    ? JSON.parse(equipmentTags)    : []
  const reasons      = matchReasons     ? JSON.parse(matchReasons)     : []
  const openingHours = openingHoursJson ? JSON.parse(openingHoursJson) : null
  const hoursDisplay = formatHours(openingHours)
  const todayIndex   = new Date().getDay()

  const dayPassPenceNum  = dayPassPence  ? parseInt(dayPassPence)  : null
  const monthlyPenceNum  = monthlyPence  ? parseInt(monthlyPence)  : null
  const ratingNum        = rating        ? parseFloat(rating)       : null
  const ratingCountNum   = ratingCount   ? parseInt(ratingCount)    : null

  const recommendation = getPricingRecommendation(days, dayPassPenceNum, monthlyPenceNum)

  // Auto-set access type based on recommendation
  function handleDaysChange(newDays: number) {
    setDays(newDays)
    const rec = getPricingRecommendation(newDays, dayPassPenceNum, monthlyPenceNum)
    if (rec) setAccessType(rec.recommendMonthly ? 'monthly' : 'day_pass')
  }

  async function handleConfirm() {
    try {
      setSaving(true)
      const departDate = new Date()
      departDate.setDate(departDate.getDate() + days)

      const res = await fetch(`${API_BASE}/api/gyms/${id}/access`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id':    'seed_user_placeholder',
        },
        body: JSON.stringify({
          accessType,
          citySlug:        'london-gb',
          expectedEndDate: departDate.toISOString().split('T')[0],
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setSaved(true)
      setShowPassport(false)
    } catch {
      console.error('Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>
          Gym details
        </Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => openMaps(address ?? '')}
        >
          <Ionicons name="navigate-outline" size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Hero image */}
                <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.heroImage}
        >
          {(photos.length > 0
            ? photos
            : [`https://picsum.photos/seed/${id}/800/300`]
          ).map((uri: string, index: number) => (
            <Image
              key={index}
              source={{ uri }}
              style={{ width: 390, height: 220 }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Score badge */}
        <View style={[styles.scoreBadge, {
          backgroundColor: colors.scoreBg,
          borderRadius:    radius.tag,
        }]}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: colors.scoreText }}>
            {matchScore}% match
          </Text>
        </View>

        <View style={{ paddingHorizontal: spacing.screen, paddingTop: spacing.lg }}>

          {/* Name */}
          <Text style={{
            fontSize:      24,
            fontWeight:    '800',
            color:         colors.textPrimary,
            letterSpacing: -0.5,
          }}>
            {name}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
            {address}
          </Text>

          {/* Rating */}
          {ratingNum && (
            <View style={[styles.ratingRow, { marginTop: spacing.sm }]}>
              {[1,2,3,4,5].map(star => (
                <Ionicons
                  key={star}
                  name={star <= Math.round(ratingNum) ? 'star' : 'star-outline'}
                  size={14}
                  color="#facc15"
                />
              ))}
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginLeft: 6 }}>
                {ratingNum.toFixed(1)}
              </Text>
              {ratingCountNum && (
                <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>
                  ({ratingCountNum.toLocaleString()} reviews)
                </Text>
              )}
            </View>
          )}

          {/* Meta chips */}
          <View style={[styles.metaRow, { marginTop: spacing.md }]}>
            <View style={[styles.metaChip, { backgroundColor: colors.surfaceRaised, borderRadius: radius.tag }]}>
              <Ionicons name="walk-outline" size={14} color={colors.textSecondary} />
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 4 }}>
                {distanceMinutes} min walk
              </Text>
            </View>
            <View style={[styles.metaChip, {
              backgroundColor: openNow === 'true' ? '#1a3a1a' : colors.surfaceRaised,
              borderRadius: radius.tag,
            }]}>
              <Ionicons
                name={openNow === 'true' ? 'checkmark-circle' : 'time-outline'}
                size={14}
                color={openNow === 'true' ? '#4ade80' : colors.textSecondary}
              />
              <Text style={{
                fontSize: 12,
                color: openNow === 'true' ? '#4ade80' : colors.textSecondary,
                marginLeft: 4,
              }}>
                {openNow === 'true' ? 'Open now' : 'Closed'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => openMaps(address ?? '')}
              style={[styles.metaChip, { backgroundColor: colors.accent, borderRadius: radius.tag }]}
            >
              <Ionicons name="navigate" size={14} color={colors.accentText} />
              <Text style={{ fontSize: 12, color: colors.accentText, marginLeft: 4, fontWeight: '700' }}>
                Directions
              </Text>
            </TouchableOpacity>
          </View>

          {/* Opening hours */}
          {hoursDisplay.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowHours(!showHours)}
              style={[styles.hoursToggle, {
                backgroundColor: colors.surface,
                borderRadius:    radius.card,
                borderColor:     colors.border,
                padding:         spacing.card,
                marginTop:       spacing.lg,
              }]}
            >
              <View style={styles.hoursToggleRow}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={{ fontSize: 13, color: colors.textPrimary, marginLeft: 8, fontWeight: '600' }}>
                  Opening hours
                </Text>
                <Ionicons
                  name={showHours ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textMuted}
                  style={{ marginLeft: 'auto' }}
                />
              </View>
              {showHours && (
                <View style={{ marginTop: spacing.md }}>
                  {hoursDisplay.map(({ day, hours }, i) => (
                    <View key={day} style={[styles.hoursRow, {
                      backgroundColor: i === todayIndex ? colors.surfaceRaised : 'transparent',
                      borderRadius: radius.tag,
                      padding: 6,
                    }]}>
                      <Text style={{
                        fontSize:   13,
                        fontWeight: i === todayIndex ? '700' : '400',
                        color:      i === todayIndex ? colors.textPrimary : colors.textSecondary,
                        width:      100,
                      }}>
                        {day}
                      </Text>
                      <Text style={{
                        fontSize:   13,
                        color:      hours === 'Closed' ? colors.error : colors.textPrimary,
                        fontWeight: i === todayIndex ? '700' : '400',
                      }}>
                        {hours}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Why it matched */}
          {reasons.length > 0 && (
            <View style={[styles.card, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    radius.card,
              padding:         spacing.card,
              marginTop:       spacing.lg,
            }]}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Why it matched</Text>
              {reasons.map((r: string) => (
                <View key={r} style={styles.reasonRow}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                  <Text style={{ fontSize: 13, color: colors.textPrimary, marginLeft: 8 }}>{r}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Equipment */}
          {tags.length > 0 && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Equipment</Text>
              <View style={styles.tagsWrap}>
                {tags.map((tag: string) => (
                  <View key={tag} style={[styles.tag, {
                    backgroundColor: colors.surfaceRaised,
                    borderColor:     colors.border,
                    borderRadius:    radius.tag,
                  }]}>
                    <Text style={{
                      fontSize:      11,
                      fontWeight:    '600',
                      color:         colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}>
                      {tag.replace(/_/g, ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          {gymReviews.length > 0 && (
            <View style={{ marginTop: spacing.lg }}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: 10 }]}>
                What people say
              </Text>
              {gymReviews.map((review: any, index: number) => (
                <View
                  key={index}
                  style={[styles.card, {
                    backgroundColor: colors.surface,
                    borderColor:     colors.border,
                    borderRadius:    radius.card,
                    padding:         spacing.card,
                    marginBottom:    8,
                  }]}
                >
                  <View style={{
                    flexDirection: 'row',
                    alignItems:    'center',
                    marginBottom:  6,
                    gap:           8,
                  }}>
                    <View style={{
                      width:           28,
                      height:          28,
                      borderRadius:    14,
                      backgroundColor: colors.surfaceRaised,
                      alignItems:      'center',
                      justifyContent:  'center',
                    }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.accent }}>
                        {review.author?.charAt(0) ?? '?'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>
                        {review.author}
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>
                        {review.time}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 1 }}>
                      {[1,2,3,4,5].map(star => (
                        <Text key={star} style={{
                          fontSize: 11,
                          color:    star <= Math.round(review.rating) ? '#facc15' : colors.border,
                        }}>★</Text>
                      ))}
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 18 }}>
                    {review.text}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* CTA */}
          {saved ? (
            <View style={[styles.savedBanner, { backgroundColor: '#1a3a1a', borderRadius: radius.card, marginTop: spacing.lg }]}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#4ade80' }}>You're going!</Text>
                <Text style={{ fontSize: 12, color: '#4ade80', opacity: 0.7, marginTop: 2 }}>
                  We'll remind you to cancel before you leave.
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setShowPassport(true)}
              activeOpacity={0.85}
              style={[styles.goBtn, {
                backgroundColor: colors.accent,
                borderRadius:    radius.card,
                marginTop:       spacing.lg,
              }]}
            >
              <Text style={{
                fontSize:      15,
                fontWeight:    '800',
                color:         colors.accentText,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                I'm going here
              </Text>
              <Text style={{ fontSize: 12, color: colors.accentText, opacity: 0.7, marginTop: 3 }}>
                We'll remind you to cancel before you leave
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>

      {/* Access passport modal */}
      <Modal
        visible={showPassport}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowPassport(false)}
      >
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ width: 36 }} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary }}>
              Plan your access
            </Text>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowPassport(false)}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.screen }}>

            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: spacing.xl }}>
              How many days are you training at {name}?
            </Text>

            {/* Duration dial */}
            <View style={[styles.dialContainer, {
              backgroundColor: colors.surface,
              borderRadius:    radius.card,
              borderColor:     colors.border,
              padding:         spacing.lg,
            }]}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted, marginBottom: spacing.lg }]}>
                Duration
              </Text>
              <View style={styles.dialRow}>
                <TouchableOpacity
                  onPress={() => handleDaysChange(Math.max(1, days - 1))}
                  style={[styles.dialBtn, {
                    backgroundColor: colors.surfaceRaised,
                    borderRadius:    radius.pill,
                    borderColor:     colors.border,
                  }]}
                >
                  <Ionicons name="remove" size={22} color={colors.textPrimary} />
                </TouchableOpacity>

                <View style={{ alignItems: 'center', minWidth: 80 }}>
                  <Text style={{
                    fontSize:      48,
                    fontWeight:    '800',
                    color:         colors.textPrimary,
                    letterSpacing: -2,
                    lineHeight:    56,
                  }}>
                    {days}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>
                    {days === 1 ? 'day' : 'days'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleDaysChange(Math.min(30, days + 1))}
                  style={[styles.dialBtn, {
                    backgroundColor: colors.accent,
                    borderRadius:    radius.pill,
                    borderColor:     colors.accent,
                  }]}
                >
                  <Ionicons name="add" size={22} color={colors.accentText} />
                </TouchableOpacity>
              </View>

              {/* Quick select */}
              <View style={[styles.quickRow, { marginTop: spacing.lg }]}>
                {[1, 3, 7, 14, 30].map(d => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => handleDaysChange(d)}
                    style={[styles.quickBtn, {
                      backgroundColor: days === d ? colors.accent : colors.surfaceRaised,
                      borderRadius:    radius.pill,
                    }]}
                  >
                    <Text style={{
                      fontSize:   12,
                      fontWeight: '700',
                      color:      days === d ? colors.accentText : colors.textSecondary,
                    }}>
                      {d === 1 ? '1d' : d === 30 ? '30d' : `${d}d`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Smart pricing recommendation */}
            {recommendation && (
              <View style={[styles.recCard, {
                backgroundColor: recommendation.recommendMonthly ? '#0f2a0f' : colors.surface,
                borderRadius:    radius.card,
                borderColor:     recommendation.recommendMonthly ? '#2a5a2a' : colors.border,
                padding:         spacing.lg,
                marginTop:       spacing.lg,
              }]}>
                {recommendation.recommendMonthly && (
                  <View style={[styles.savingBadge, {
                    backgroundColor: colors.accent,
                    borderRadius:    radius.pill,
                  }]}>
                    <Text style={{
                      fontSize:   11,
                      fontWeight: '800',
                      color:      colors.accentText,
                    }}>
                      SAVE {recommendation.savingPercent}%
                    </Text>
                  </View>
                )}
                <Text style={{
                  fontSize:    16,
                  fontWeight:  '800',
                  color:       recommendation.recommendMonthly ? '#4ade80' : colors.textPrimary,
                  marginTop:   recommendation.recommendMonthly ? spacing.sm : 0,
                  letterSpacing: -0.3,
                }}>
                  {recommendation.headline}
                </Text>
                <Text style={{
                  fontSize:   13,
                  color:      recommendation.recommendMonthly ? 'rgba(74,222,128,0.7)' : colors.textMuted,
                  marginTop:  spacing.sm,
                  lineHeight: 19,
                }}>
                  {recommendation.subline}
                </Text>

                {recommendation.recommendMonthly && (
                  <View style={[styles.comparisonRow, { marginTop: spacing.md }]}>
                    <View style={[styles.comparisonBox, {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius:    radius.tag,
                      padding:         spacing.sm,
                    }]}>
                      <Text style={{ fontSize: 11, color: 'rgba(74,222,128,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Day passes
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#f87171', marginTop: 2 }}>
                        £{((dayPassPenceNum ?? 0) * days / 100).toFixed(0)}
                      </Text>
                      <Text style={{ fontSize: 11, color: 'rgba(74,222,128,0.5)', marginTop: 1 }}>
                        {days}x £{((dayPassPenceNum ?? 0) / 100).toFixed(0)}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={18} color="rgba(74,222,128,0.4)" />
                    <View style={[styles.comparisonBox, {
                      backgroundColor: 'rgba(74,222,128,0.1)',
                      borderRadius:    radius.tag,
                      padding:         spacing.sm,
                    }]}>
                      <Text style={{ fontSize: 11, color: 'rgba(74,222,128,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Monthly
                      </Text>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#4ade80', marginTop: 2 }}>
                        £{((monthlyPenceNum ?? 0) / 100).toFixed(0)}
                      </Text>
                      <Text style={{ fontSize: 11, color: 'rgba(74,222,128,0.5)', marginTop: 1 }}>
                        Up to 30 days
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Selected option summary */}
            <View style={[styles.card, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    radius.card,
              padding:         spacing.card,
              marginTop:       spacing.lg,
            }]}>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                You're going with
              </Text>
              <Text style={{
                fontSize:    18,
                fontWeight:  '800',
                color:       colors.textPrimary,
                marginTop:   4,
              }}>
                {accessType === 'monthly'
                  ? `Monthly — £${((monthlyPenceNum ?? 0) / 100).toFixed(0)}`
                  : `${days} day pass${days > 1 ? 'es' : ''} — £${((dayPassPenceNum ?? 0) * days / 100).toFixed(0)}`
                }
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
                {accessType === 'monthly'
                  ? `Full access for up to 30 days. We'll remind you to cancel on day ${days}.`
                  : `${days} visit${days > 1 ? 's' : ''} at ${name}.`
                }
              </Text>
            </View>

            {/* Confirm */}
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={saving}
              activeOpacity={0.85}
              style={[styles.goBtn, {
                backgroundColor: colors.accent,
                borderRadius:    radius.card,
                marginTop:       spacing.xl,
                opacity:         saving ? 0.7 : 1,
              }]}
            >
              <Text style={{
                fontSize:      15,
                fontWeight:    '800',
                color:         colors.accentText,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                {saving ? 'Saving...' : 'Confirm — I\'m going'}
              </Text>
            </TouchableOpacity>

          </ScrollView>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:    { flex: 1 },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: 16,
    paddingVertical:   12,
    borderBottomWidth: 1,
  },
  iconBtn:   { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  heroImage: { width: '100%', height: 220 },
  scoreBadge: {
    position:          'absolute',
    top:               180,
    right:             16,
    paddingHorizontal: 10,
    paddingVertical:    4,
  },
  ratingRow:  { flexDirection: 'row', alignItems: 'center' },
  metaRow:    { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  metaChip:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6 },
  hoursToggle:  { borderWidth: 1 },
  hoursToggleRow: { flexDirection: 'row', alignItems: 'center' },
  hoursRow:   { flexDirection: 'row', alignItems: 'center' },
  card:       { borderWidth: 1 },
  sectionLabel: {
    fontSize:      11,
    fontWeight:    '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reasonRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  tagsWrap:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag:        { paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  goBtn:      { padding: 18, alignItems: 'center' },
  savedBanner:{ flexDirection: 'row', alignItems: 'center', padding: 16 },
  dialContainer: { borderWidth: 1 },
  dialRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dialBtn:    { width: 52, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  quickRow:   { flexDirection: 'row', justifyContent: 'space-between' },
  quickBtn:   { paddingHorizontal: 14, paddingVertical: 7 },
  recCard:    { borderWidth: 1 },
  savingBadge:{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4 },
  comparisonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  comparisonBox: { flex: 1 },
})