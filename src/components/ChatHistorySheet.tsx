import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'
import type { ChatThread } from '../hooks/useChat'

interface Props {
  visible: boolean
  threads: ChatThread[]
  activeThreadId: string | null
  onClose: () => void
  onPickThread: (id: string) => void
  onNewChat: () => void
}

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime()
  const now = Date.now()
  const diff = now - d
  const m = Math.floor(diff / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export function ChatHistorySheet({
  visible,
  threads,
  activeThreadId,
  onClose,
  onPickThread,
  onNewChat,
}: Props) {
  const { colors, spacing, radius } = useTheme()

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.4 }}>
              Chats
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onNewChat}
            style={[
              styles.newBtn,
              {
                backgroundColor: colors.accent,
                borderRadius: radius.btn,
                marginHorizontal: spacing.screen,
              },
            ]}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color={colors.accentText} />
            <Text style={[styles.newBtnText, { color: colors.accentText }]}>NEW CHAT</Text>
          </TouchableOpacity>

          <ScrollView
            style={{ marginTop: 16 }}
            contentContainerStyle={{ paddingHorizontal: spacing.screen, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {threads.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No past chats yet. Start a new one above.
              </Text>
            ) : (
              threads.map((t) => {
                const isActive = t.id === activeThreadId
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => onPickThread(t.id)}
                    style={[
                      styles.threadRow,
                      {
                        backgroundColor: isActive ? colors.surfaceRaised : colors.surface,
                        borderRadius: radius.card,
                      },
                    ]}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.threadTitle, { color: colors.textPrimary }]}
                        numberOfLines={1}
                      >
                        {t.title || 'New chat'}
                      </Text>
                      <Text style={[styles.threadMeta, { color: colors.textSecondary }]}>
                        {formatRelative(t.lastMessageAt)}
                      </Text>
                    </View>
                    {isActive ? (
                      <View style={[styles.activeBadge, { backgroundColor: colors.accent }]}>
                        <Text style={[styles.activeBadgeText, { color: colors.accentText }]}>NOW</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                )
              })
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '80%',
    paddingTop: 8,
    paddingBottom: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#666',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  newBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  threadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  threadTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  threadMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 24,
  },
})
