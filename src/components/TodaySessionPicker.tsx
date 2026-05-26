import React from 'react'
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'

const OPTIONS = [
  { key: 'push',      label: 'Push day',      desc: 'Chest, shoulders, triceps' },
  { key: 'pull',      label: 'Pull day',      desc: 'Back, biceps, rear delts' },
  { key: 'legs',      label: 'Legs day',      desc: 'Quads, hamstrings, glutes' },
  { key: 'upper',     label: 'Upper body',    desc: 'Full upper session' },
  { key: 'lower',     label: 'Lower body',    desc: 'Full lower session' },
  { key: 'full_body', label: 'Full body',     desc: 'Hit everything' },
  { key: 'rest',      label: 'Rest day',      desc: 'Mobility and recovery' },
]

interface Props {
  visible:  boolean
  onClose:  () => void
  onPick:   (session: string) => void
  current?: string | null
}

export function TodaySessionPicker({ visible, onClose, onPick, current }: Props) {
  const { colors, spacing, radius } = useTheme()

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
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />

          <View style={[styles.header, { paddingHorizontal: spacing.screen }]}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.4 }}>
              Today's session
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={{
            fontSize:           12,
            color:              colors.textMuted,
            paddingHorizontal:  spacing.screen,
            marginBottom:       16,
            lineHeight:         16,
          }}>
            What did you train today? We'll remember it.
          </Text>

          <View style={{ paddingHorizontal: spacing.screen, paddingBottom: 28 }}>
            {OPTIONS.map((opt) => {
              const active = current === opt.key
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => { onPick(opt.key); onClose() }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection:    'row',
                    alignItems:       'center',
                    paddingVertical:  14,
                    paddingHorizontal: 14,
                    borderRadius:     12,
                    borderWidth:      1,
                    borderColor:      active ? colors.accent : colors.border,
                    backgroundColor:  active ? 'rgba(200,255,87,0.08)' : colors.surface,
                    marginBottom:     8,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{
                      fontSize:   15,
                      fontWeight: '700',
                      color:      active ? colors.accent : colors.textPrimary,
                      letterSpacing: -0.2,
                    }}>
                      {opt.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {opt.desc}
                    </Text>
                  </View>
                  {active && (
                    <Ionicons name="checkmark" size={18} color={colors.accent} />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
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
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
})
