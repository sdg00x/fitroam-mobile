import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../src/theme/useTheme'
import { useUser } from '../src/hooks/useUser'
import { GetAccessForm } from '../src/components/GetAccessForm'

export default function WelcomeScreen() {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()
  const { user } = useUser()
  const [authMode, setAuthMode] = useState<'signup' | 'signin' | null>(null)

  // Routing is owned entirely by AuthGate in _layout.tsx.
  // Welcome only creates the user; the gate reacts and redirects.

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { paddingHorizontal: spacing.screen }]}>
        <View style={{ flex: 1, justifyContent: 'flex-end', paddingBottom: 40 }}>
          <Text style={[styles.eyebrow, { color: colors.accentReadable }]}>FITROAM</Text>
          <Text style={[styles.headline, { color: colors.textPrimary }]}>
            Find your gym{'\n'}in any city
          </Text>
          <Text style={[styles.subline, { color: colors.textMuted }]}>
            Smart matching, trip planning, and your fitness history — wherever you train.
          </Text>
        </View>

        <View style={{ gap: 12, paddingBottom: 40 }}>
          <TouchableOpacity
            onPress={() => setAuthMode('signup')}
            activeOpacity={0.85}
            style={[styles.primaryCta, {
              backgroundColor: colors.accent,
              borderRadius:    radius.pill,
            }]}
          >
            <Text style={{ fontSize: 15, fontWeight: '800', color: colors.background, letterSpacing: 0.3 }}>
              CREATE ACCOUNT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAuthMode('signin')}
            activeOpacity={0.7}
            style={{ paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Already have an account? <Text style={{ color: colors.accentReadable, fontWeight: '700' }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={authMode !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAuthMode(null)}
      >
        <GetAccessForm
          mode={authMode ?? 'signup'}
          onCancel={() => setAuthMode(null)}
          onComplete={() => {
            // Close modal only. AuthGate sees the new user and routes:
            // not-onboarded -> /onboarding/city, onboarded -> /(tabs).
            setAuthMode(null)
          }}
          onSwitchMode={(m) => setAuthMode(m)}
        />
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  eyebrow: {
    fontSize:      12,
    fontWeight:    '800',
    letterSpacing: 2,
    marginBottom:  12,
  },
  headline: {
    fontSize:      40,
    fontWeight:    '800',
    letterSpacing: -1.5,
    lineHeight:    44,
    marginBottom:  16,
  },
  subline: {
    fontSize:   15,
    lineHeight: 22,
  },
  primaryCta: {
    paddingVertical:   16,
    alignItems:        'center',
    justifyContent:    'center',
  },
})
