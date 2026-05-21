import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@fitroam:user'

export interface User {
  id:    string   // UUID generated locally on first sign-up
  name:  string
  email: string
  phone: string
  createdAt: string
}

// Tiny UUID v4 generator — no dependency needed for this scale
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function useUser() {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (raw) setUser(JSON.parse(raw))
      })
      .catch(err => console.warn('[useUser] load failed', err))
      .finally(() => setLoading(false))
  }, [])

  const signUp = useCallback(async (input: { name: string; email: string; phone: string }) => {
    const newUser: User = {
      id:        generateId(),
      name:      input.name.trim(),
      email:     input.email.trim().toLowerCase(),
      phone:     input.phone.trim(),
      createdAt: new Date().toISOString(),
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    setUser(newUser)
    return newUser
  }, [])

  const update = useCallback(async (patch: Partial<Pick<User, 'name' | 'email' | 'phone'>>) => {
    if (!user) return null
    const next: User = {
      ...user,
      ...(patch.name  !== undefined && { name:  patch.name.trim()  }),
      ...(patch.email !== undefined && { email: patch.email.trim().toLowerCase() }),
      ...(patch.phone !== undefined && { phone: patch.phone.trim() }),
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
    return next
  }, [user])

  const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      setUser(raw ? JSON.parse(raw) : null)
    } catch {}
  }, [])

  const signOut = useCallback(async () => {
    setUser(null)
    await AsyncStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    user,
    loading,
    isSignedIn: !!user,
    signUp,
    update,
    signOut,
    refresh,
  }
}

// Validation helpers, exported for use in forms
export function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export function isValidUKPhone(s: string): boolean {
  // Accepts +44 7xxx xxx xxx, 07xxx xxx xxx, with or without spaces, dashes
  const clean = s.replace(/[\s\-()]/g, '')
  return /^(\+44|0)7\d{9}$/.test(clean)
}

export function isValidName(s: string): boolean {
  return s.trim().length >= 2
}
