import React, { useState } from 'react'
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Linking,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useUser } from '../hooks/useUser'
import { useTheme } from '../theme/useTheme'
import { BookingInterestModal } from './BookingInterestModal'

// Shape: matches both ChatGym (from useChat) AND tripGyms[].gym (from TripCard's widened type).
// Kept loose so the component is reusable across the two surfaces.
export interface ChatGymCardGym {
  id:             string
  name:           string
  address:        string | null
  dayPassPence:   number | null
  dayPassUrl:     string | null
  photoUrls:      string[]
  equipmentTags?: string[] | null
  verified:       boolean
}

interface Props {
  gym:     ChatGymCardGym
  /** When set, an integer rank badge ("#1", "#2"...) is shown. */
  rank?:   number
  /** When true, a "Saved" badge with a check icon is shown instead of a rank. */
  saved?:  boolean
  /** Attribute the booking-interest row to a trip (used on Trip Detail surface). */
  tripId?: string
  /** Drives the `source` field of the booking_interest row. */
  source?: 'gym_card' | 'trip_detail'
}

function formatPrice(pence: number | null | undefined): string {
  if (pence == null) return 'price unverified · call ahead'
  return `£${(pence / 100).toFixed(2).replace(/\.00$/, '')} day pass`
}

function formatEquipmentTag(tag: string): string {
  return tag.replace(/_/g, ' ')
}

export function ChatGymCard({ gym, rank, saved, tripId, source }: Props) {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()
  const { user } = useUser()
  const [modalOpen, setModalOpen] = useState(false)

  const canConcierge = gym.verified === true
  const canDayPass   = !!gym.dayPassUrl

  return (
    <>
      <TouchableOpacity
        onPress={() => router.push(`/gym/${gym.id}`)}
        activeOpacity={0.9}
        style={[styles.card, {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
        }]}
      >
        {gym.photoUrls?.[0] ? (
          <Image source={{ uri: gym.photoUrls[0] }} style={styles.photo} />
        ) : null}
        <View style={styles.body}>
          <View style={styles.header}>
            {rank ? (
              <Text style={[styles.rank, { color: colors.accentReadable }]}>#{rank}</Text>
            ) : saved ? (
              <View style={[styles.savedPill, { backgroundColor: colors.surfaceRaised }]}>
                <Ionicons name="checkmark" size={12} color={colors.accent} />
                <Text style={[styles.savedText, { color: colors.accentReadable }]}>SAVED</Text>
              </View>
            ) : null}
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={2}>
              {gym.name}
            </Text>
          </View>

          {gym.address ? (
            <Text style={[styles.address, { color: colors.textSecondary }]} numberOfLines={1}>
              {gym.address}
            </Text>
          ) : null}

          <Text style={[styles.price, {
            color: gym.dayPassPence == null ? colors.textMuted : colors.textPrimary,
          }]}>
            {formatPrice(gym.dayPassPence)}
          </Text>

          {gym.equipmentTags?.length ? (
            <View style={styles.tagRow}>
              {gym.equipmentTags.slice(0, 4).map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: colors.surfaceRaised, borderRadius: radius.tag }]}
                >
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                    {formatEquipmentTag(tag)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Tap-for-details affordance — louder for unverified gyms (where it's the primary action) */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 }}>
            <Text style={{
              color: canConcierge ? colors.textMuted : colors.accent,
              fontSize: canConcierge ? 11 : 13,
              fontWeight: canConcierge ? '400' : '700',
              opacity: canConcierge ? 0.7 : 1,
            }}>
              Tap card for details ›
            </Text>
          </View>

          {/* GREEN button — different copy + payload for verified vs unverified gyms */}
          {user ? (
            <TouchableOpacity
              onPress={() => setModalOpen(true)}
              activeOpacity={0.85}
              style={[
                styles.greenBtn,
                canConcierge
                  ? { backgroundColor: colors.accent }
                  : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.accent },
              ]}
            >
              <Text style={[styles.greenBtnMain, { color: canConcierge ? colors.accentText : colors.accent }]}>
                {canConcierge ? 'Let us handle everything for you' : 'Notify me when we cover this gym'}
              </Text>
              <Text style={[styles.greenBtnSub, { color: canConcierge ? colors.accentText : colors.accent }]}>
                {canConcierge ? '£2.99 · early access' : 'early access'}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Friction caption — names what "everything" means, anchors the value of the offer */}
          {canConcierge && user ? (
            <Text style={[styles.frictionCaption, { color: colors.textMuted }]}>
              (fill forms · ID upload · payment · sign-ups · reception desk)
            </Text>
          ) : null}

          {/* GREY button — day pass link, always shown when URL is present */}
          {canDayPass ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(gym.dayPassUrl!)}
              activeOpacity={0.85}
              style={[styles.greyBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.greyBtnText, { color: colors.textSecondary }]}>
                Get pass myself
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>

      {user ? (
        <BookingInterestModal
          visible={modalOpen}
          onClose={() => setModalOpen(false)}
          gym={{
            id: gym.id,
            name: gym.name,
            address: gym.address,
            dayPassUrl: gym.dayPassUrl,
            verified: gym.verified,
          }}
          user={{ id: user.id, email: user.email ?? null, name: user.name ?? null }}
          tripId={tripId}
          source={source ?? 'gym_card'}
        />
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 140,
  },
  body: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  rank: {
    fontSize: 14,
    fontWeight: '800',
  },
  savedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  savedText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 19,
  },
  address: {
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
  },
  greenBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 14,
  },
  greenBtnMain: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  frictionCaption: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.7,
    letterSpacing: 0.2,
  },
  greenBtnSub: {
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.75,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  greyBtn: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
  },
  greyBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
})
