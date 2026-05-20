import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useLocation } from './useLocation'

const STORAGE_KEY = '@fitroam:viewingLocation'

export interface ViewingLocation {
  lat:              number
  lng:              number
  cityName:         string
  citySlug:         string
  country:          string | null
  placeId:          string | null
  formattedAddress: string | null
  source:           'gps' | 'manual'
}

export function useViewingLocation() {
  const gps = useLocation()
  const [manual,  setManual]  = useState<ViewingLocation | null>(null)
  const [loading, setLoading] = useState(true)

  // Load any previously saved manual location
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (raw) setManual(JSON.parse(raw))
      } catch {}
      setLoading(false)
    })()
  }, [])

  const set = useCallback(async (loc: Omit<ViewingLocation, 'source'>) => {
    const full: ViewingLocation = { ...loc, source: 'manual' }
    setManual(full)
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(full))
    } catch {}
  }, [])

  const reset = useCallback(async () => {
    setManual(null)
    try {
      await AsyncStorage.removeItem(STORAGE_KEY)
    } catch {}
  }, [])

  // Effective location: manual override wins, else GPS
  const effective: ViewingLocation | null = manual ?? (
    gps.lat && gps.lng ? {
      lat:              gps.lat,
      lng:              gps.lng,
      cityName:         gps.cityName || 'your area',
      citySlug:         (gps.cityName || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      country:          null,
      placeId:          null,
      formattedAddress: null,
      source:           'gps',
    } : null
  )

  return {
    location: effective,
    loading:  loading || gps.loading,
    setLocation:   set,
    resetLocation: reset,
    isManual:      !!manual,
  }
}
