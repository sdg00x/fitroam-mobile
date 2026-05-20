import React from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../src/theme/useTheme'
import { useLocation } from '../../src/hooks/useLocation'

export default function HomeScreen() {
  const { colors, spacing } = useTheme()
  const { cityName, loading: locLoading } = useLocation()

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={{ paddingTop: 20, paddingBottom: 28 }}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
            Good morning
          </Text>
          <Text style={{
            fontSize:      32,
            fontWeight:    '800',
            color:         colors.textPrimary,
            letterSpacing: -1,
            marginTop:     4,
          }}>
            {locLoading ? 'Locating...' : cityName}
          </Text>
        </View>

        {/* Placeholder cards — built out in later steps */}
        <Placeholder colors={colors} label="Today's training" body="Coming soon — once your training pattern is set" />
        <Placeholder colors={colors} label="Next trip"        body="Coming soon — your upcoming trips will appear here" />
        <Placeholder colors={colors} label={`Today in ${cityName || 'your city'}`} body="Coming soon — gyms, routes, and parks for today" />
        <Placeholder colors={colors} label="Your passport"    body="Coming soon — recent visits and active access" />
      </ScrollView>
    </SafeAreaView>
  )
}

function Placeholder({ colors, label, body }: { colors: any; label: string; body: string }) {
  return (
    <View style={[styles.card, {
      backgroundColor: colors.surface,
      borderColor:     colors.border,
    }]}>
      <Text style={[styles.cardEyebrow, { color: colors.accent }]}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
        {body}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  eyebrow: {
    fontSize:      11,
    fontWeight:    '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  card: {
    borderWidth:  1,
    borderRadius: 12,
    padding:      20,
    marginBottom: 12,
  },
  cardEyebrow: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1.2,
  },
})
