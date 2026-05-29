import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../src/theme/useTheme'

export default function ResultsScreen() {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()
  const params = useLocalSearchParams<{ prompt?: string }>()
  const prompt = typeof params.prompt === 'string' ? params.prompt : ''

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Header: back chevron */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Back to prompt"
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* User's prompt echoed at top */}
        {prompt ? (
          <View
            style={[
              styles.promptBubble,
              {
                backgroundColor: colors.card ?? colors.background,
                borderColor: colors.border,
                borderRadius: radius.md,
                marginBottom: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.promptLabel, { color: colors.textMuted }]}>YOU ASKED</Text>
            <Text style={[styles.promptText, { color: colors.text, marginTop: 6 }]}>{prompt}</Text>
          </View>
        ) : null}

        {/* AI placeholder */}
        <View style={styles.placeholderWrap}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor: '#c8ff57',
              },
            ]}
          >
            <Ionicons name="sparkles" size={28} color="#1a1a1a" />
          </View>
          <Text style={[styles.headline, { color: colors.text, marginTop: spacing.lg }]}>
            FitRoam AI is on the way
          </Text>
          <Text style={[styles.body, { color: colors.textMuted, marginTop: spacing.sm }]}>
            The concierge that turns your prompt into a curated list of gyms — with day passes, equipment, and a direct booking link — ships next.
          </Text>
          <Text style={[styles.body, { color: colors.textMuted, marginTop: spacing.md }]}>
            You're seeing this because the AI endpoint isn't wired yet. Closed beta will get it first.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  content: {
    flexGrow: 1,
    paddingTop: 8,
  },
  promptBubble: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  promptLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  promptText: {
    fontSize: 16,
    lineHeight: 22,
  },
  placeholderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
  },
})
