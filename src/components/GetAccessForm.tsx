import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native'
import { useTheme } from '../theme/useTheme'
import { useUser, isValidEmail, isValidUKPhone, isValidName } from '../hooks/useUser'

interface Props {
  mode:         'access' | 'signup' | 'update'
  contextName?: string
  onComplete:   () => void
  onCancel?:    () => void
}

export function GetAccessForm({ mode, contextName, onComplete, onCancel }: Props) {
  const { colors, spacing, radius } = useTheme()
  const { user, signUp, update } = useUser()

  const [name,  setName]  = useState(mode === 'update' && user ? user.name  : '')
  const [email, setEmail] = useState(mode === 'update' && user ? user.email : '')
  const [phone, setPhone] = useState(mode === 'update' && user ? user.phone : '')
  const [submitting, setSubmitting] = useState(false)

  const eyebrow =
    mode === 'access' ? 'GET ACCESS' :
    mode === 'update' ? 'EDIT DETAILS' :
    'CREATE ACCOUNT'

  const title =
    mode === 'access'
      ? (contextName ? `One step before ${contextName}` : 'A few details to get you in')
      : mode === 'update'
      ? 'Your details'
      : 'Save your spot in FitRoam'

  const subtitle =
    mode === 'access'
      ? 'We need a way to reach you about your access. Stays private.'
      : mode === 'update'
      ? 'Update your name, email, or phone. Changes save instantly.'
      : 'So your trips and saved gyms stay with you across devices.'

  const cta =
    mode === 'access' ? 'CONTINUE' :
    mode === 'update' ? 'SAVE CHANGES' :
    'CREATE ACCOUNT'

  async function handleSubmit() {
    if (!isValidName(name)) {
      Alert.alert('Name needed', 'Tell us what to call you.')
      return
    }
    if (!isValidEmail(email)) {
      Alert.alert('Email needed', 'Please enter a valid email.')
      return
    }
    if (!isValidUKPhone(phone)) {
      Alert.alert('UK phone needed', 'Use a UK number — 07xxx or +44 7xxx.')
      return
    }

    try {
      setSubmitting(true)
      if (mode === 'update') {
        await update({ name, email, phone })
      } else {
        await signUp({ name, email, phone })
      }
      onComplete()
    } catch (err) {
      Alert.alert('Could not save', 'Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screen,
          paddingTop:        20,
          paddingBottom:     40,
          flexGrow:          1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{
          fontSize:      11,
          fontWeight:    '700',
          letterSpacing: 1.4,
          color:         colors.accent,
          marginBottom:  10,
        }}>
          {eyebrow}
        </Text>
        <Text style={{
          fontSize:      28,
          fontWeight:    '800',
          color:         colors.textPrimary,
          letterSpacing: -1,
          lineHeight:    32,
          marginBottom:  8,
        }}>
          {title}
        </Text>
        <Text style={{
          fontSize:     14,
          color:        colors.textMuted,
          lineHeight:   20,
          marginBottom: 28,
        }}>
          {subtitle}
        </Text>

        <Field label="YOUR NAME" colors={colors}>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="First and last"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoComplete="name"
            style={[styles.input, {
              color:           colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    radius.row,
            }]}
          />
        </Field>

        <Field label="EMAIL" colors={colors}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={[styles.input, {
              color:           colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    radius.row,
            }]}
          />
        </Field>

        <Field label="PHONE (UK)" colors={colors}>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="07xxx xxx xxx"
            placeholderTextColor={colors.textMuted}
            autoComplete="tel"
            keyboardType="phone-pad"
            style={[styles.input, {
              color:           colors.textPrimary,
              backgroundColor: colors.surface,
              borderColor:     colors.border,
              borderRadius:    radius.row,
            }]}
          />
        </Field>

        <Text style={{
          fontSize:   11,
          color:      colors.textMuted,
          marginTop:  4,
          lineHeight: 16,
        }}>
          We use your details only for booking confirmations and your passport. Never shared, never sold.
        </Text>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting}
          style={{
            backgroundColor: submitting ? colors.surface : colors.accent,
            paddingVertical: 16,
            borderRadius:    radius.card,
            alignItems:      'center',
            marginTop:       24,
          }}
        >
          <Text style={{
            fontSize:      14,
            fontWeight:    '800',
            color:         submitting ? colors.textMuted : colors.accentText,
            letterSpacing: 0.5,
          }}>
            {submitting ? 'SAVING...' : cta}
          </Text>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity onPress={onCancel} activeOpacity={0.7} style={{ marginTop: 12, paddingVertical: 12, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted }}>
              Not now
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

function Field({ label, colors, children }: { label: string; colors: any; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{
        fontSize:      10,
        fontWeight:    '700',
        letterSpacing: 1.2,
        color:         colors.textMuted,
        marginBottom:  6,
      }}>
        {label}
      </Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize:          15,
    fontWeight:        '600',
    paddingHorizontal: 14,
    paddingVertical:   13,
    borderWidth:       1,
  },
})
