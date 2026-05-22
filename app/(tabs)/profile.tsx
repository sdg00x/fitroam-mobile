import React, { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useProfile } from '../../src/hooks/useProfile'
import { useUser } from '../../src/hooks/useUser'
import { useStats } from '../../src/hooks/useStats'
import { GetAccessForm } from '../../src/components/GetAccessForm'
import {
  labelForActivity,
  labelForPattern,
  labelForMonthlyBudget,
  labelForTravelBudget,
  labelForDistance,
  avatarColorForActivity,
  initialsFromName,
} from '../../src/lib/labels'

const API_BASE = 'http://192.168.0.64:3000'

export default function ProfileScreen() {
  const { colors, spacing, radius } = useTheme()
  const { profile, reset: resetProfile } = useProfile()
  const { user, signOut, refresh: refreshUser } = useUser()
  const { sessions, cities, refresh: refreshStats } = useStats()
  const router = useRouter()

  const [tripCount, setTripCount] = useState(0)
  const [showSignup, setShowSignup] = useState(false)

  // Refetch stats + trip count whenever the tab is focused
  useFocusEffect(useCallback(() => {
    refreshUser()
    refreshStats()
    fetchTripCount()
  }, []))

  async function fetchTripCount() {
    if (!user?.id) {
      setTripCount(0)
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/trips`, {
        headers: { 'x-user-id': user.id },
      })
      if (!res.ok) return
      const data = await res.json()
      setTripCount(data.total ?? data.trips?.length ?? 0)
    } catch {
      // silent
    }
  }

  function confirmSignOut() {
    Alert.alert(
      'Sign out?',
      'This clears your account, preferences, and visit history. You can sign back up by tapping "Get access" on any gym.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: doSignOut },
      ]
    )
  }

  async function doSignOut() {
    await signOut()
    await resetProfile()
    await AsyncStorage.multiRemove(['@fitroam:visits', '@fitroam:viewingLocation'])
    router.replace('/onboarding/style')
  }

  const displayName  = user?.name || 'Sign up to save your profile'
  const handle       = user?.email || ''
  const avatarColor  = avatarColorForActivity(profile.primaryActivity)
  const initials     = user?.name ? initialsFromName(user.name) : '?'
  const trainingLabel = labelForPattern(profile.trainingPattern)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity card */}
        <TouchableOpacity
          onPress={() => user ? router.push("/profile/identity") : setShowSignup(true)}
          activeOpacity={0.8}
          style={[styles.identity, {
          backgroundColor: colors.surface,
          borderColor:     colors.border,
          borderRadius:    radius.card,
        }]}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={{
              fontSize:   28,
              fontWeight: '800',
              color:      '#0a0a0a',
              letterSpacing: -0.5,
            }}>
              {initials}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              style={{
                fontSize:      18,
                fontWeight:    '800',
                color:         colors.textPrimary,
                letterSpacing: -0.3,
              }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {!!handle && (
              <Text
                style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}
                numberOfLines={1}
              >
                {handle}
              </Text>
            )}
            {!user && (
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 16 }}>
                Create an account to save your profile and trips.
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Stats grid */}
        <View style={styles.statsRow}>
          <StatCell label="Sessions" value={String(sessions)} colors={colors} />
          <StatCell label="Cities"   value={String(cities)}   colors={colors} />
          <StatCell label="Saved"    value="0"                colors={colors} />
          <StatCell label="Trips"    value={String(tripCount)} colors={colors} />
        </View>

        {/* Training profile */}
        <SectionHeader label="Training profile" colors={colors} />
        <View style={[styles.section, {
          backgroundColor: colors.surface,
          borderColor:     colors.border,
          borderRadius:    radius.card,
        }]}>
          <ProfileRow label="Style"          value={labelForActivity(profile.primaryActivity)} colors={colors} onPress={() => router.push("/profile/sections/activity")} />
          <ProfileRow label="Pattern"        value={trainingLabel}                             colors={colors} onPress={() => router.push("/profile/sections/training")} />
          <ProfileRow label="Monthly budget" value={labelForMonthlyBudget(profile.monthlyBudget)}   colors={colors} onPress={() => router.push("/profile/sections/budget")} />
          <ProfileRow label="Travel budget"  value={labelForTravelBudget(profile.travelDailyBudget)} colors={colors} onPress={() => router.push("/profile/sections/budget")} />
          <ProfileRow label="Distance"       value={labelForDistance(profile.maxDistanceMinutes)} colors={colors} onPress={() => router.push("/profile/sections/budget")} last />
        </View>

        <TouchableOpacity
          onPress={() => router.push('/profile/edit')}
          activeOpacity={0.8}
          style={[styles.editBtn, {
            borderColor: colors.border,
            borderRadius: radius.card,
          }]}
        >
          <Ionicons name="create-outline" size={18} color={colors.textPrimary} />
          <Text style={{
            fontSize:   14,
            fontWeight: '700',
            color:      colors.textPrimary,
            marginLeft: 8,
          }}>
            Edit profile
          </Text>
        </TouchableOpacity>

        {/* Fitness passport preview */}
        <SectionHeader label="Fitness passport" colors={colors} topSpace />
        <TouchableOpacity
          onPress={() => router.push('/profile/passport')}
          activeOpacity={0.8}
          style={[styles.section, {
            backgroundColor: colors.surface,
            borderColor:     colors.border,
            borderRadius:    radius.card,
            alignItems:      'center',
            paddingVertical: 28,
          }]}
        >
          <Ionicons name="airplane-outline" size={28} color={colors.textMuted} />
          <Text style={{
            fontSize:   13,
            fontWeight: '700',
            color:      colors.textPrimary,
            marginTop:  10,
          }}>
            {sessions === 0 ? 'No visits yet' : `${cities} ${cities === 1 ? 'city' : 'cities'} stamped`}
          </Text>
          <Text style={{
            fontSize:   11,
            color:      colors.textMuted,
            marginTop:  4,
            textAlign:  'center',
            maxWidth:   240,
            lineHeight: 16,
          }}>
            {sessions === 0
              ? 'Train somewhere new to start your passport.'
              : 'Your training history across cities.'}
          </Text>
        </TouchableOpacity>

        {/* Account */}
        <SectionHeader label="Account" colors={colors} topSpace />
        <View style={[styles.section, {
          backgroundColor: colors.surface,
          borderColor:     colors.border,
          borderRadius:    radius.card,
        }]}>
          <AccountRow
            icon="notifications-outline"
            label="Notifications"
            value="On"
            colors={colors}
            onPress={() => Alert.alert('Coming soon')}
          />
          <AccountRow
            icon="moon-outline"
            label="Appearance"
            value="System"
            colors={colors}
            onPress={() => Alert.alert('Coming soon')}
          />
          <AccountRow
            icon="log-out-outline"
            label="Sign out"
            value=""
            colors={colors}
            onPress={confirmSignOut}
            destructive
            last
          />
        </View>
      </ScrollView>

      <Modal
        visible={showSignup}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSignup(false)}
      >
        <GetAccessForm
          mode="signup"
          onClose={() => setShowSignup(false)}
          onComplete={() => {
            setShowSignup(false)
            refreshUser()
          }}
        />
      </Modal>
    </SafeAreaView>
  )
}

function StatCell({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={[styles.statCell, {
      backgroundColor: colors.surface,
      borderColor:     colors.border,
    }]}>
      <Text style={{
        fontSize:      22,
        fontWeight:    '800',
        color:         colors.accent,
        letterSpacing: -0.5,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize:      10,
        fontWeight:    '700',
        color:         colors.textMuted,
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop:     4,
      }}>
        {label}
      </Text>
    </View>
  )
}

function SectionHeader({ label, colors, topSpace }: { label: string; colors: any; topSpace?: boolean }) {
  return (
    <Text style={{
      fontSize:      11,
      fontWeight:    '700',
      letterSpacing: 1.2,
      color:         colors.textMuted,
      textTransform: 'uppercase',
      marginTop:     topSpace ? 28 : 24,
      marginBottom:  10,
    }}>
      {label}
    </Text>
  )
}

function ProfileRow({ label, value, colors, last, onPress }: { label: string; value: string; colors: any; last?: boolean; onPress?: () => void }) {
  const content = (
    <View style={{
      flexDirection:    "row",
      justifyContent:   "space-between",
      alignItems:       "center",
      paddingVertical:  12,
      paddingHorizontal: 16,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: colors.border,
    }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textMuted }}>
        {label}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", maxWidth: "60%" }}>
        <Text
          style={{ fontSize: 13, fontWeight: "700", color: colors.textPrimary, textAlign: "right" }}
          numberOfLines={1}
        >
          {value}
        </Text>
        {onPress && (
          <Ionicons name="chevron-forward" size={14} color={colors.textMuted} style={{ marginLeft: 6 }} />
        )}
      </View>
    </View>
  )
  if (!onPress) return content
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      {content}
    </TouchableOpacity>
  )
}

function AccountRow({
  icon, label, value, colors, onPress, destructive, last,
}: {
  icon:         any
  label:        string
  value:        string
  colors:       any
  onPress:      () => void
  destructive?: boolean
  last?:        boolean
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection:     'row',
        alignItems:        'center',
        paddingVertical:   14,
        paddingHorizontal: 16,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <Ionicons
        name={icon}
        size={18}
        color={destructive ? '#f87171' : colors.textPrimary}
      />
      <Text style={{
        flex:       1,
        fontSize:   14,
        fontWeight: '600',
        color:      destructive ? '#f87171' : colors.textPrimary,
        marginLeft: 12,
      }}>
        {label}
      </Text>
      {!!value && (
        <Text style={{
          fontSize:   13,
          color:      colors.textMuted,
          marginRight: 6,
        }}>
          {value}
        </Text>
      )}
      {!destructive && (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  identity: {
    flexDirection:  'row',
    alignItems:     'center',
    padding:        16,
    borderWidth:    1,
    marginTop:      20,
    marginBottom:   16,
  },
  avatar: {
    width:           64,
    height:          64,
    borderRadius:    32,
    alignItems:      'center',
    justifyContent:  'center',
  },
  statsRow: {
    flexDirection:  'row',
    gap:            8,
    marginBottom:   4,
  },
  statCell: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: 14,
    borderRadius:    12,
    borderWidth:     1,
  },
  section: {
    borderWidth: 1,
  },
  editBtn: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth:    1,
    marginTop:      10,
  },
})
