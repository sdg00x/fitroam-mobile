import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'

interface Props {
  title:      string
  subtitle?:  string
  canSave:    boolean   // enables Save button
  saving:     boolean
  onSave:     () => Promise<void> | void
  children:   React.ReactNode
}

export function SectionPage({ title, subtitle, canSave, saving, onSave, children }: Props) {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
          {title}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {subtitle && (
          <Text style={{
            fontSize:   13,
            color:      colors.textMuted,
            lineHeight: 18,
            marginTop:  4,
            marginBottom: 20,
          }}>
            {subtitle}
          </Text>
        )}
        {children}
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing.screen, backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={onSave}
          disabled={!canSave || saving}
          activeOpacity={0.85}
          style={{
            backgroundColor: canSave && !saving ? colors.accent : colors.surfaceRaised,
            paddingVertical: 16,
            borderRadius:    radius.card,
            alignItems:      'center',
          }}
        >
          {saving ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Text style={{
              fontSize:      14,
              fontWeight:    '800',
              color:         canSave ? colors.accentText : colors.textMuted,
              letterSpacing: 0.5,
            }}>
              {canSave ? 'SAVE CHANGES' : 'NO CHANGES'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    paddingVertical: 14,
  },
  footer: {
    borderTopWidth:  1,
    paddingVertical: 14,
  },
})
