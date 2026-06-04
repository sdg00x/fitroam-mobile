import React, { useState, useEffect, useRef } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Modal, StyleSheet, ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme'
import { API_BASE } from '../lib/api'


export interface PickedPlace {
  placeId:          string
  name:             string
  formattedAddress: string
  city:             string
  citySlug:         string
  country:          string
  lat:              number
  lng:              number
}

interface Prediction {
  placeId:   string
  mainText:  string
  secondary: string
  fullText:  string
}

interface Props {
  visible:           boolean
  onClose:           () => void
  onPick:            (place: PickedPlace) => void
  onUseCurrentLocation?: () => void
  showCurrentLocation?:  boolean
}

export function PlacePicker({ visible, onClose, onPick, onUseCurrentLocation, showCurrentLocation }: Props) {
  const { colors, spacing } = useTheme()
  const [query,       setQuery]       = useState('')
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading,     setLoading]     = useState(false)
  const [resolving,   setResolving]   = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() || query.trim().length < 2) {
      setPredictions([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/places/autocomplete?q=${encodeURIComponent(query.trim())}`
        )
        if (!res.ok) throw new Error()
        const data = await res.json()
        setPredictions(data.predictions || [])
      } catch {
        setPredictions([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Reset on close
  useEffect(() => {
    if (!visible) {
      setQuery('')
      setPredictions([])
    }
  }, [visible])

  async function handlePick(pred: Prediction) {
    try {
      setResolving(true)
      const res = await fetch(`${API_BASE}/api/places/details/${pred.placeId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const p = data.place
      if (!p || p.lat == null || p.lng == null) throw new Error()

      const city     = p.city || pred.mainText
      const citySlug = (city || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      onPick({
        placeId:          p.placeId,
        name:             p.name || pred.mainText,
        formattedAddress: p.formattedAddress || pred.fullText,
        city,
        citySlug,
        country:          p.country || '',
        lat:              p.lat,
        lng:              p.lng,
      })
    } catch {
      // Silent fail — user can try another result
    } finally {
      setResolving(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{
          backgroundColor: colors.background,
          borderTopLeftRadius:  24,
          borderTopRightRadius: 24,
          paddingTop:           8,
          paddingBottom:        32,
          height:               '85%',
        }}>
          <View style={{ alignItems: 'center', paddingVertical: 12 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
          </View>

          <View style={{
            flexDirection:    'row',
            justifyContent:   'space-between',
            alignItems:       'center',
            paddingHorizontal: spacing.screen,
            paddingBottom:    12,
          }}>
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary }}>
              Where are you going?
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={{
            paddingHorizontal: spacing.screen,
            paddingBottom:     12,
          }}>
            <View style={[styles.searchBox, {
              backgroundColor: colors.surface,
              borderColor:     colors.border,
            }]}>
              <Ionicons name="search" size={18} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                autoFocus
                placeholder="City, neighborhood, hotel, or address"
                placeholderTextColor={colors.textMuted}
                style={{
                  fontSize:  15,
                  color:     colors.textPrimary,
                  marginLeft: 10,
                  flex:       1,
                }}
              />
              {loading && <ActivityIndicator size="small" color={colors.textMuted} />}
            </View>
          </View>

          {resolving && (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              <ActivityIndicator color={colors.accent} />
            </View>
          )}

          {showCurrentLocation && (
            <TouchableOpacity
              onPress={() => {
                onUseCurrentLocation?.()
                onClose()
              }}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: spacing.screen,
                paddingVertical:   14,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection:     "row",
                alignItems:        "center",
              }}
            >
              <Ionicons name="navigate" size={18} color={colors.accent} />
              <Text style={{
                fontSize:   15,
                fontWeight: "700",
                color:      colors.accent,
                marginLeft: 12,
              }}>
                Use my current location
              </Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={predictions}
            keyExtractor={p => p.placeId}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              query.trim().length >= 2 && !loading ? (
                <View style={{ padding: spacing.screen }}>
                  <Text style={{ fontSize: 13, color: colors.textMuted }}>
                    No matches yet
                  </Text>
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handlePick(item)}
                activeOpacity={0.7}
                disabled={resolving}
                style={{
                  paddingHorizontal: spacing.screen,
                  paddingVertical:   14,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  flexDirection:     'row',
                  alignItems:        'center',
                }}
              >
                <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                    {item.mainText}
                  </Text>
                  {item.secondary ? (
                    <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                      {item.secondary}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: 14,
    paddingVertical:   12,
    borderRadius:      12,
    borderWidth:       1,
  },
})
