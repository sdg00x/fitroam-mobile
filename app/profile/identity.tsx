import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useUser, isValidName } from '../../src/hooks/useUser'

export default function IdentityScreen() {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()
  const { user, update } = useUser()

  const [name,       setName]       = useState(user?.name ?? '')
  const [saving,     setSaving]     = useState(false)

  // If user loads after mount, sync the input
  useEffect(() => {
    if (user?.name && !name) setName(user.name)
  }, [user])

  const hasChanges = user ? name.trim() !== user.name : false

  async function handleSave() {
    if (!isValidName(name)) {
      Alert.alert('Name needed', 'Tell us what to call you.')
      return
    }
    if (!hasChanges) {
      router.back()
      return
    }
    try {
      setSaving(true)
      await update({ name })
      router.back()
    } catch {
      Alert.alert('Could not save', 'Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
          Your details
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.screen,
            paddingTop:        16,
            paddingBottom:     40,
            flexGrow:          1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Editable: Name */}
          <Text style={[styles.label, { color: colors.textMuted }]}>YOUR NAME</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="First and last"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            style={[styles.input, {
              color:           colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    radius.row,
            }]}
          />

          {/* Read-only: Email */}
          <Text style={[styles.label, { color: colors.textMuted, marginTop: 22 }]}>EMAIL</Text>
          <View style={[styles.lockedRow, {
            backgroundColor: colors.surface,
            borderColor:     colors.border,
            borderRadius:    radius.row,
          }]}>
            <Text
              style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 }}
              numberOfLines={1}
            >
              {user?.email || '—'}
            </Text>
            <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
          </View>

          {/* Read-only: Phone */}
          <Text style={[styles.label, { color: colors.textMuted, marginTop: 14 }]}>PHONE</Text>
          <View style={[styles.lockedRow, {
            backgroundColor: colors.surface,
            borderColor:     colors.border,
            borderRadius:    radius.row,
          }]}>
            <Text
              style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 }}
              numberOfLines={1}
            >
              {user?.phone || '—'}
            </Text>
            <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
          </View>

          <Text style={{
            fontSize:   11,
            color:      colors.textMuted,
            marginTop:  10,
            lineHeight: 16,
          }}>
            Email and phone are tied to your bookings. To change either, contact support.
          </Text>

          <View style={{ flex: 1 }} />

          {/* Save */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
            style={{
              backgroundColor: saving ? colors.surface : (hasChanges ? colors.accent : colors.surfaceRaised),
              paddingVertical: 16,
              borderRadius:    radius.card,
              alignItems:      'center',
              marginTop:       28,
            }}
          >
            <Text style={{
              fontSize:      14,
              fontWeight:    '800',
              color:         hasChanges && !saving ? colors.accentText : colors.textMuted,
              letterSpacing: 0.5,
            }}>
              {saving ? 'SAVING...' : hasChanges ? 'SAVE CHANGES' : 'NO CHANGES'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  label: {
    fontSize:      10,
    fontWeight:    '700',
    letterSpacing: 1.2,
    marginBottom:  6,
  },
  input: {
    fontSize:          15,
    fontWeight:        '600',
    paddingHorizontal: 14,
    paddingVertical:   13,
    borderWidth:       1,
  },
  lockedRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: 14,
    paddingVertical:   13,
    borderWidth:       1,
  },
})
