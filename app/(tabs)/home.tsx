import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../src/theme/useTheme'
import { useUser } from '../../src/hooks/useUser'
import { WaveformIcon } from '../../src/components/WaveformIcon'

const EXAMPLE_PROMPTS = [
  '"London this weekend, upper body, walking distance"',
  '"NYC next week, serious lifting near Midtown"',
  '"Miami next month, 3 days, under £60"',
]

export default function HomeScreen() {
  const { colors, spacing, radius } = useTheme()
  const router = useRouter()
  const { user } = useUser()
  const inputRef = useRef<TextInput>(null)
  const [prompt, setPrompt] = useState('')

  const firstName = user?.name ? user.name.split(/\s+/)[0] : null

  const greetingTimeOfDay = () => {
    const h = new Date().getHours()
    if (h < 12) return 'GOOD MORNING'
    if (h < 18) return 'GOOD AFTERNOON'
    return 'GOOD EVENING'
  }

  const handleExampleTap = (text: string) => {
    const clean = text.replace(/^"|"$/g, '')
    setPrompt(clean)
    inputRef.current?.focus()
  }

  const handleSend = () => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    Keyboard.dismiss()
    router.push({ pathname: '/results', params: { prompt: trimmed } })
    setPrompt('')
  }

  const handleMicPress = () => {
    // Voice wiring deferred — focus input for now.
    inputRef.current?.focus()
  }

  const hasText = prompt.trim().length > 0

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Top bar: waveform icon + wordmark, centered */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.screen }]}>
        <View style={styles.brandRow}>
          <WaveformIcon size={20} color={colors.accent} />
          <Text style={[styles.wordmark, { color: colors.textPrimary }]}>FitRoam</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingHorizontal: spacing.screen }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.timeOfDay, { color: colors.textSecondary }]}>
            {greetingTimeOfDay()}
          </Text>
          <Text style={[styles.greeting, { color: colors.textPrimary }]}>
            Where are you training{firstName ? `, ${firstName}` : ''}?
          </Text>
          <Text style={[styles.purpose, { color: colors.textSecondary }]}>
            Tell me your trip and what you need. I'll find gyms that fit.
          </Text>

          <View style={styles.tryWrap}>
            <Text style={[styles.tryLabel, { color: colors.textSecondary }]}>TRY</Text>
            {EXAMPLE_PROMPTS.map((text) => (
              <TouchableOpacity
                key={text}
                onPress={() => handleExampleTap(text)}
                style={[
                  styles.exampleChip,
                  { backgroundColor: colors.surface, borderRadius: radius.card },
                ]}
                activeOpacity={0.6}
              >
                <Text style={[styles.exampleText, { color: colors.textPrimary }]}>{text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bottom input row: pill + adjacent CTA (waveform mic OR send) */}
        <View style={[styles.inputRow, { paddingHorizontal: spacing.screen, backgroundColor: colors.background }]}>
          <View style={[styles.inputPill, { backgroundColor: colors.surface }]}>
            <TextInput
              ref={inputRef}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Ask anything"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, { color: colors.textPrimary }]}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit
            />
          </View>

          {hasText ? (
            <TouchableOpacity
              onPress={handleSend}
              hitSlop={8}
              accessibilityLabel="Send to FitRoam"
              style={[styles.ctaBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-up" size={26} color={colors.accentText} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleMicPress}
              hitSlop={8}
              accessibilityLabel="Voice input"
              style={[styles.ctaBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.85}
            >
              <WaveformIcon size={26} color={colors.accentText} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 32,
    paddingBottom: 24,
  },
  timeOfDay: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  purpose: {
    fontSize: 17,
    lineHeight: 24,
    marginTop: 20,
  },
  tryWrap: { marginTop: 36 },
  tryLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  exampleChip: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
    paddingBottom: 12,
  },
  inputPill: {
    flex: 1,
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 52,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    paddingVertical: 4,
    maxHeight: 120,
  },
  ctaBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
})
