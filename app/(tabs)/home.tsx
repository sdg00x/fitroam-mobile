import React, { useRef, useState, useEffect } from 'react'
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
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useTheme } from '../../src/theme/useTheme'
import { useUser } from '../../src/hooks/useUser'
import { useChat, ChatMessage, ChatGym } from '../../src/hooks/useChat'
import { WaveformIcon } from '../../src/components/WaveformIcon'
import { ChatGymCard } from '../../src/components/ChatGymCard'
import { ChatHistorySheet } from '../../src/components/ChatHistorySheet'

const EXAMPLE_PROMPTS = [
  '"London this weekend, upper body, walking distance"',
  '"NYC next week, serious lifting near Midtown"',
  '"Miami next month, 3 days, under £60"',
]


// ---------- One message block ----------
function useLoadingCopy(active: boolean) {
  const PHRASES = [
    'Thinking…',
    'Checking your trips…',
    'Searching gyms…',
    'Pulling it together…',
  ]
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!active) {
      setIdx(0)
      return
    }
    const t = setInterval(() => setIdx((i) => (i + 1) % PHRASES.length), 2500)
    return () => clearInterval(t)
  }, [active])
  return PHRASES[idx]
}

function MessageBlock({ message, onRetry }: { message: ChatMessage; onRetry?: (id: string) => void }) {
  const { colors, spacing, radius } = useTheme()

  if (message.role === 'user') {
    return (
      <View style={[styles.msgWrap, { alignItems: 'flex-end' }]}>
        <View
          style={[
            styles.userBubble,
            {
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              opacity: message.failed ? 0.55 : 1,
            },
          ]}
        >
          <Text style={[styles.userText, { color: colors.textPrimary }]}>{message.content}</Text>
        </View>
        {message.failed ? (
          <TouchableOpacity
            onPress={() => onRetry?.(message.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginTop: 4 }}
          >
            <Text style={{ color: colors.accentReadable, fontSize: 12, fontWeight: '600' }}>
              Failed — tap to retry
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    )
  }

  return (
    <View style={styles.msgWrap}>
      <View style={styles.aiHeader}>
        <WaveformIcon size={14} color={colors.accent} />
        <Text style={[styles.aiLabel, { color: colors.textSecondary }]}>FITROAM</Text>
      </View>
      <Text style={[styles.aiText, { color: colors.textPrimary }]}>{message.content}</Text>
      {message.gyms.length > 0 ? (
        <View style={{ marginTop: 12, gap: 10 }}>
          {message.gyms.map((g, i) => (
            <ChatGymCard key={g.id} gym={g} rank={i + 1} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

// ---------- Main screen ----------
export default function HomeScreen() {
  const { colors, spacing, radius } = useTheme()
  const { user } = useUser()
  const params = useLocalSearchParams<{
    planningTripId?: string
    planningLegId?: string
    planningTripName?: string
    planningLegOrder?: string
    planningCity?: string
    planningLat?: string
    planningLng?: string
  }>()
  const router = useRouter()
  const consumedPlanningRef = useRef<string | null>(null)
  const inputRef = useRef<TextInput>(null)
  const [voiceHintShown, setVoiceHintShown] = useState(false)

  // When user taps "Plan this leg" from Trip Detail, prefill the input with leg context.
  // The ref guards against re-injecting if the user clears the input and the params are still in the URL.
  useEffect(() => {
    if (!params.planningCity || !params.planningLegId) return
    if (consumedPlanningRef.current === params.planningLegId) return
    consumedPlanningRef.current = params.planningLegId

    const city = params.planningCity
    const legOrder = params.planningLegOrder ?? '1'
    const tripName = params.planningTripName
    // Build a prompt that gives the AI everything it needs: city, leg ordinal, trip name if useful.
    const prefill = tripName
      ? `Plan leg ${legOrder} of "${tripName}" — I'm in ${city}. What gyms should I hit?`
      : `I'm planning a leg in ${city}. What gyms should I hit?`
    setPrompt(prefill)
    // Focus input on next tick so the field is hot for editing.
    // Bigger delay than 100ms — tab transition + screen mount take time on real devices.
    setTimeout(() => inputRef.current?.focus(), 400)
    // Don't clear params via setParams (causes effect re-fire loop on some expo-router versions).
    // The consumedPlanningRef guard prevents re-firing if user clears input and params are still in URL.
  }, [params.planningLegId, params.planningCity, params.planningLegOrder, params.planningTripName])
  const scrollRef = useRef<ScrollView>(null)
  const [prompt, setPrompt] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)

  const {
    messages,
    threads,
    threadId,
    loading,
    sending,
    send,
    retrySend,
    newThread,
    loadThread,
  } = useChat()
  const loadingCopy = useLoadingCopy(sending)

  const firstName = user?.name ? user.name.split(/\s+/)[0] : null
  const isEmpty = messages.length === 0
  const hasText = prompt.trim().length > 0

  const greetingTimeOfDay = () => {
    const h = new Date().getHours()
    if (h < 12) return 'GOOD MORNING'
    if (h < 18) return 'GOOD AFTERNOON'
    return 'GOOD EVENING'
  }

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (!isEmpty) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
    }
  }, [messages.length, sending])

  const handleExampleTap = (text: string) => {
    const clean = text.replace(/^"|"$/g, '')
    setPrompt(clean)
    inputRef.current?.focus()
  }

  const handleSend = () => {
    const trimmed = prompt.trim()
    if (!trimmed) return
    Keyboard.dismiss()
    setPrompt('')
    send(trimmed)
  }

  const handleMicPress = () => {
    inputRef.current?.focus()
    if (!voiceHintShown) setVoiceHintShown(true)
  }

  const handleNewChat = async () => {
    setHistoryOpen(false)
    await newThread()
  }

  const handlePickThread = async (id: string) => {
    setHistoryOpen(false)
    await loadThread(id)
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingHorizontal: spacing.screen }]}>
        <View style={{ width: 28 }} />
        <View style={styles.brandRow}>
          <WaveformIcon size={20} color={colors.accent} />
          <Text style={[styles.wordmark, { color: colors.textPrimary }]}>FitRoam</Text>
        </View>
        <TouchableOpacity onPress={() => setHistoryOpen(true)} hitSlop={12} accessibilityLabel="Chat history">
          <Ionicons name="time-outline" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Body */}
        {loading ? (
          <View style={styles.centerWrap}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : isEmpty ? (
          // Empty state — greeting + TRY chips
          <ScrollView
            contentContainerStyle={[styles.emptyContent, { paddingHorizontal: spacing.screen }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.timeOfDay, { color: colors.textSecondary }]}>{greetingTimeOfDay()}</Text>
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
                  style={[styles.exampleChip, { backgroundColor: colors.surface, borderRadius: radius.card }]}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.exampleText, { color: colors.textPrimary }]}>{text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          // Thread view
          <>
            <View style={[styles.threadActionBar, { paddingHorizontal: spacing.screen }]}>
              <TouchableOpacity
                onPress={handleNewChat}
                style={[styles.newChatPill, { backgroundColor: colors.surface, borderRadius: 20 }]}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={14} color={colors.textPrimary} />
                <Text style={[styles.newChatPillText, { color: colors.textPrimary }]}>New chat</Text>
              </TouchableOpacity>
            </View>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[styles.threadContent, { paddingHorizontal: spacing.screen }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((m) => (
              <MessageBlock key={m.id} message={m} onRetry={retrySend} />
            ))}
            {sending ? (
              <View style={styles.msgWrap}>
                <View style={styles.aiHeader}>
                  <WaveformIcon size={14} color={colors.accent} />
                  <Text style={[styles.aiLabel, { color: colors.textSecondary }]}>FITROAM</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator size="small" color={colors.accent} />
                  <Text style={[styles.aiText, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                    {loadingCopy}
                  </Text>
                </View>
              </View>
            ) : null}
          </ScrollView>
          </>
        )}

        {/* Bottom input row */}
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
              editable={!sending}
            />
          </View>

          {hasText ? (
            <TouchableOpacity
              onPress={handleSend}
              hitSlop={8}
              disabled={sending}
              accessibilityLabel="Send"
              style={[styles.ctaBtn, { backgroundColor: colors.accent, opacity: sending ? 0.5 : 1 }]}
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
        {voiceHintShown ? (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 14,
            paddingVertical: 8,
            marginHorizontal: 16,
            marginBottom: 8,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
              Voice coming soon — type instead for now ✨
            </Text>
            <TouchableOpacity onPress={() => setVoiceHintShown(false)} hitSlop={8}>
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <ChatHistorySheet
        visible={historyOpen}
        threads={threads}
        activeThreadId={threadId}
        onClose={() => setHistoryOpen(false)}
        onPickThread={handlePickThread}
        onNewChat={handleNewChat}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty state
  emptyContent: {
    flexGrow: 1,
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
  // Thread view
  threadContent: {
    paddingTop: 16,
    paddingBottom: 24,
    gap: 18,
  },
  msgWrap: {
    width: '100%',
  },
  userBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userText: {
    fontSize: 15,
    lineHeight: 21,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  aiText: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Gym card
  // Input row
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
  threadActionBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
    paddingBottom: 4,
  },
  newChatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  newChatPillText: {
    fontSize: 12,
    fontWeight: '600',
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
