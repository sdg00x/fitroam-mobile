import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { useTheme } from '../theme/useTheme'

export interface GymData {
  id:              string
  name:            string
  address:         string
  distanceMinutes: number
  equipmentTags:   string[]
  rating:          number | null
  openNow:         boolean
  matchScore:      number
  matchReasons:    string[]
  priceDisplay:    string
  priceSubDisplay: string
}

interface Props {
  gym:       GymData
  variant?:  'featured' | 'compact'
  onGoHere?: (gym: GymData) => void
  onPress?:  (gym: GymData) => void
}

export function GymCard({ gym, variant = 'featured', onGoHere, onPress }: Props) {
  const { colors, spacing, radius } = useTheme()

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        onPress={() => onPress?.(gym)}
        activeOpacity={0.8}
        style={[styles.compact, {
          backgroundColor: colors.surface,
          borderRadius:    radius.row,
          borderColor:     colors.border,
          padding:         spacing.card,
        }]}
      >
        <Image
          source={{ uri: `https://picsum.photos/seed/${gym.id}/80/80` }}
          style={[styles.compactPhoto, { borderRadius: radius.tag }]}
          resizeMode="cover"
        />
        <View style={styles.compactInfo}>
          <Text style={{
            fontSize:   13,
            fontWeight: '700',
            color:      colors.textPrimary,
          }}>
            {gym.name}
          </Text>
          <Text style={{
            fontSize:  11,
            color:     colors.textMuted,
            marginTop: 2,
          }}>
            {gym.distanceMinutes} min · {gym.matchReasons[0] ?? ''}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize:   12,
            fontWeight: '800',
            color:      colors.accent,
          }}>
            {gym.matchScore}%
          </Text>
          <Text style={{
            fontSize:  11,
            color:     colors.textMuted,
            marginTop: 2,
          }}>
            {gym.priceDisplay}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  // Featured card
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.featured, {
        backgroundColor: colors.surface,
        borderRadius:    radius.card,
        borderColor:     colors.border,
      }]}
    >
      {/* Header */}
      <View style={[styles.featuredHeader, {
        backgroundColor: colors.surfaceRaised,
        padding:         spacing.card,
      }]}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={{
            fontSize:     15,
            fontWeight:   '800',
            color:        colors.textPrimary,
            letterSpacing: -0.3,
          }}>
            {gym.name}
          </Text>
          <Text style={{
            fontSize:  11,
            color:     colors.textMuted,
            marginTop: 3,
          }}>
            {gym.distanceMinutes} min walk · {gym.openNow ? 'Open now' : 'Closed'}
          </Text>
        </View>
        <View style={[styles.scorePill, {
          backgroundColor: colors.scoreBg,
          borderRadius:    radius.tag,
        }]}>
          <Text style={{
            fontSize:   11,
            fontWeight: '800',
            color:      colors.scoreText,
          }}>
            {gym.matchScore}% match
          </Text>
        </View>
      </View>

      {/* Photo */}
      <Image
        source={{ uri: `https://picsum.photos/seed/${gym.id}/400/160` }}
        style={styles.gymPhoto}
        resizeMode="cover"
      />

      {/* Tags */}
      <View style={[styles.tagsRow, { padding: spacing.card }]}>
        {gym.equipmentTags.slice(0, 4).map(tag => (
          <View
            key={tag}
            style={[styles.tag, {
              backgroundColor: colors.surfaceRaised,
              borderRadius:    radius.tag,
              borderColor:     colors.border,
            }]}
          >
            <Text style={{
              fontSize:      10,
              fontWeight:    '600',
              color:         colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              {tag.replace(/_/g, ' ')}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={[styles.featuredFooter, {
        backgroundColor: colors.surfaceFooter,
        padding:         spacing.card,
        borderRadius:    radius.card,
      }]}>
        <View>
          <Text style={{
            fontSize:   13,
            fontWeight: '800',
            color:      colors.textPrimary,
          }}>
            {gym.priceDisplay}
          </Text>
          {gym.priceSubDisplay ? (
            <Text style={{
              fontSize:  10,
              color:     colors.textMuted,
              marginTop: 2,
            }}>
              {gym.priceSubDisplay}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={() => onGoHere?.(gym)}
          activeOpacity={0.8}
          style={[styles.goBtn, {
            backgroundColor: colors.accent,
            borderRadius:    radius.btn,
          }]}
        >
          <Text style={{
            fontSize:      11,
            fontWeight:    '800',
            color:         colors.accentText,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            I'm going
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  featured: {
    borderWidth:  1,
    overflow:     'hidden',
    marginBottom: 10,
  },
  featuredHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
  },
  scorePill: {
    paddingHorizontal: 9,
    paddingVertical:   3,
  },
  gymPhoto: {
    width:  '100%',
    height: 140,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           5,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical:   3,
    borderWidth:       1,
  },
  featuredFooter: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  goBtn: {
    paddingHorizontal: 14,
    paddingVertical:    7,
  },
  compact: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    borderWidth:   1,
    marginBottom:  8,
  },
  compactPhoto: {
    width:     44,
    height:    44,
    flexShrink: 0,
  },
  compactInfo: {
    flex: 1,
  },
})