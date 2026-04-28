import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@fitroam:profile'

export interface UserProfile {
  // Activities
  primaryActivity:    string
  activities:         string[]

  // Where they train
  facilityTypes:      string[]

  // How they live
  lifestyle:          string[]

  // Budget — two contexts
  monthlyBudget:      string
  travelDailyBudget:  string

  // Distance tolerance
  maxDistanceMinutes: number

  // What matters
  priorities:         string[]

  onboarded:          boolean
}

const DEFAULT_PROFILE: UserProfile = {
  primaryActivity:    'lifting',
  activities:         [],
  facilityTypes:      [],
  lifestyle:          [],
  monthlyBudget:      '20_to_40',
  travelDailyBudget:  '10_to_20',
  maxDistanceMinutes: 15,
  priorities:         [],
  onboarded:          false,
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) })
      })
      .catch(err => console.warn('[useProfile] load failed', err))
      .finally(() => setLoading(false))
  }, [])

  const save = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates }
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        .catch(err => console.warn('[useProfile] save failed', err))
      return next
    })
  }, [])

  const reset = useCallback(async () => {
    setProfile(DEFAULT_PROFILE)
    await AsyncStorage.removeItem(STORAGE_KEY)
  }, [])

  return { profile, loading, save, reset }
}