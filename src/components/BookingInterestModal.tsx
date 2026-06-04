import React, { useEffect, useState } from 'react'
import {
  View, Text, Modal, TouchableOpacity, StyleSheet, Pressable,
  ActivityIndicator, Linking,
} from 'react-native'
import { useTheme } from '../theme/useTheme'
import { recordBookingInterest } from '../lib/bookingInterest'

export interface BookingInterestModalProps {
  visible:    boolean
  onClose:    () => void
  /** Gym to record interest for. Modal handles both verified and unverified paths based on `verified`. */
  gym: {
    id:          string
    name:        string
    address:     string | null
    dayPassUrl:  string | null
    verified:    boolean
  }
  /** Current user (always present when modal opens — caller ensures). */
  user: {
    id:    string
    email: string | null
    name:  string | null
  }
  /** Optional trip to attribute the interest to. */
  tripId?: string
  /** Where the modal was opened from — drives the `source` field on the row. */
  source?: 'gym_card' | 'trip_detail'
}

type Phase = 'idle' | 'submitting' | 'success' | 'error'

export function BookingInterestModal({
  visible, onClose, gym, user, tripId, source,
}: BookingInterestModalProps) {
  const { colors, spacing, radius } = useTheme()
  const [phase, setPhase] = useState<Phase>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)

  // Trigger the POST as soon as modal opens.
  // We don't make the user tap a "confirm" button — the tap that opened
  // the modal IS the confirmation. Modal is showing them what happened.
  useEffect(() => {
    if (!visible) return
    if (phase !== 'idle') return
    if (!user.email) {
      setPhase('error')
      setErrMsg('We need your email on file. Update your profile and try again.')
      return
    }
    let cancelled = false
    setPhase('submitting')
    setErrMsg(null)
    ;(async () => {
      const res = gym.verified
        ? await recordBookingInterest({
            kind: 'verified',
            userId: user.id,
            gymId: gym.id,
            email: user.email!,
            tripId,
            source,
          })
        : await recordBookingInterest({
            kind: 'unverified',
            userId: user.id,
            gymPlaceId: gym.id,
            gymName: gym.name,
            gymAddress: gym.address ?? undefined,
            email: user.email!,
            tripId,
            source,
          })
      if (cancelled) return
      if (res.ok) {
        setPhase('success')
      } else {
        setPhase('error')
        setErrMsg(res.error)
      }
    })()
    return () => { cancelled = true }
  }, [visible])

  // Reset when fully closed so a re-open does a fresh POST
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        setPhase('idle')
        setErrMsg(null)
      }, 300)
      return () => clearTimeout(t)
    }
  }, [visible])

  function openDayPass() {
    if (gym.dayPassUrl) Linking.openURL(gym.dayPassUrl)
    onClose()
  }

  const firstName = (user.name ?? '').split(' ')[0] || 'there'

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, {
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: spacing.screen,
          }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {phase === 'submitting' && (
            <View style={styles.body}>
              <ActivityIndicator color={colors.accent} />
              <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 13 }}>
                One sec…
              </Text>
            </View>
          )}

          {phase === 'success' && (
            <View style={styles.body}>
              <Text style={[styles.headline, { color: colors.textPrimary }]}>
                Got it, {firstName}.
              </Text>

              <Text style={[styles.bodyCopy, { color: colors.textSecondary }]}>
                {gym.verified
                  ? `Concierge isn't live yet, but you've just told us this matters to you — and that's how we decide what to build next.\n\nYou'll be the first person we contact when we flip the switch on ${gym.name}, and we're moving fast to make that happen.`
                  : `${gym.name} isn't in our verified network yet — we haven't checked their day-pass setup ourselves. We've logged your interest so we can prioritise verifying gyms like this one next.\n\nYou'll be the first to know when ${gym.name} is in our network.`}
              </Text>

              {gym.dayPassUrl ? (
                <>
                  <Text style={[styles.bridgeCopy, { color: colors.textMuted }]}>
                    Want to grab the day pass yourself in the meantime?
                  </Text>
                  <TouchableOpacity
                    onPress={openDayPass}
                    activeOpacity={0.85}
                    style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                  >
                    <Text style={[styles.primaryBtnText, { color: colors.accentText }]}>
                      Open day pass page →
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={[styles.bridgeCopy, { color: colors.textMuted, marginBottom: 16 }]}>
                  We'll send the booking page when concierge goes live.
                </Text>
              )}

              <TouchableOpacity onPress={onClose} style={styles.secondaryBtn}>
                <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {phase === 'error' && (
            <View style={styles.body}>
              <Text style={[styles.headline, { color: colors.textPrimary }]}>
                Hmm.
              </Text>
              <Text style={[styles.bodyCopy, { color: colors.textSecondary }]}>
                Couldn't register your interest just now. {errMsg ? `(${errMsg})` : ''}{"\n\n"}
                You can still grab the day pass yourself in the meantime.
              </Text>
              {gym.dayPassUrl && (
                <TouchableOpacity
                  onPress={openDayPass}
                  activeOpacity={0.85}
                  style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
                >
                  <Text style={[styles.primaryBtnText, { color: colors.accentText }]}>
                    Open day pass page →
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.secondaryBtn}>
                <Text style={{ color: colors.textMuted, fontSize: 13, fontWeight: '600' }}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: 280,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  body: {
    paddingVertical: 8,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  bodyCopy: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  bridgeCopy: {
    fontSize: 13,
    marginBottom: 12,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
})
