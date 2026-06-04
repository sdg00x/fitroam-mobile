import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useUserContext } from '../context/UserProvider'
import { API_BASE } from '../lib/api'

const STORAGE_KEY = '@fitroam:profile'

export interface UserProfile {
  primaryActivity:    string
  activities:         string[]
  facilityTypes:      string[]
  lifestyle:          string[]
  monthlyBudget:      string
  travelDailyBudget:  string
  maxDistanceMinutes: number
  priorities:         string[]
  onboarded:          boolean
  trainingPattern:    string | null
  citySlug:           string | null
}

const DEFAULT_PROFILE: UserProfile = {
  primaryActivity:    'staying_in_shape',
  activities:         [],
  facilityTypes:      [],
  lifestyle:          [],
  monthlyBudget:      'any_quality',
  travelDailyBudget:  'any_quality',
  maxDistanceMinutes: 20,
  priorities:         [],
  onboarded:          false,
  trainingPattern:    null,
  citySlug:           null,
}

interface ProfileContextValue {
  profile: UserProfile
  loading: boolean
  save:    (updates: Partial<UserProfile>) => Promise<void>
  reset:   () => Promise<void>
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [loading, setLoading] = useState(true)
  const { user } = useUserContext()
  const lastUserIdRef = useRef<string | null | undefined>(undefined)

  // Load profile whenever user changes (or on first mount when user is null)
  useEffect(() => {
    const currentId = user?.id ?? null

    // Skip if the user id hasn't changed
    if (lastUserIdRef.current === currentId) return
    lastUserIdRef.current = currentId

    let cancelled = false

    if (!currentId) {
      setProfile(DEFAULT_PROFILE)
      setLoading(false)
      return
    }

    setLoading(true)

    ;(async () => {
      // 1. Try cache first for instant render
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY)
        if (cancelled) return
        if (raw) {
          setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) })
          setLoading(false)
          return
        }
      } catch {}

      // 2. Cache miss — fetch from server
      try {
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { 'x-user-id': currentId },
        })
        if (!res.ok) throw new Error('fetch failed')
        const data = await res.json()
        if (cancelled) return
        const fresh = { ...DEFAULT_PROFILE, ...data.profile }
        setProfile(fresh)
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)).catch(() => {})
      } catch (err) {
        console.warn('[ProfileProvider] server fetch failed', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [user?.id])

  const save = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id) {
      console.warn('[ProfileProvider] save called with no user')
      return
    }

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method:  'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id':    user.id,
        },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error(`PATCH failed: ${res.status}`)
      const data = await res.json()
      const fresh = { ...DEFAULT_PROFILE, ...data.profile }
      setProfile(fresh)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
    } catch (err) {
      console.warn('[ProfileProvider] PATCH failed, applying local only', err)
      setProfile(prev => {
        const next = { ...prev, ...updates }
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {})
        return next
      })
    }
  }, [user?.id])

  const reset = useCallback(async () => {
    setProfile(DEFAULT_PROFILE)
    await AsyncStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <ProfileContext.Provider value={{ profile, loading, save, reset }}>
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used inside <ProfileProvider>')
  return ctx
}
