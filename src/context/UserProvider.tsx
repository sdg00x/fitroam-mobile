import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_BASE = 'http://192.168.0.64:3000'

const STORAGE_KEY = '@fitroam:user'

export interface User {
  id:        string
  name:      string
  email:     string
  phone:     string
  createdAt: string
}

// Tiny UUID v4 generator — same as before
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface UserContextValue {
  user:       User | null
  loading:    boolean
  isSignedIn: boolean
  signUp:     (input: { name: string; email: string; phone: string }) => Promise<User>
  signIn:     (email: string) => Promise<User>
  update:     (patch: Partial<Pick<User, 'name' | 'email' | 'phone'>>) => Promise<User | null>
  signOut:    () => Promise<void>
  refresh:    () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load once on mount
  useEffect(() => {
    let cancelled = false
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => {
        if (cancelled) return
        if (raw) {
          try { setUser(JSON.parse(raw)) } catch {}
        }
      })
      .catch(err => console.warn('[UserProvider] load failed', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const signUp = useCallback(async (input: { name: string; email: string; phone: string }) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        email: input.email.trim().toLowerCase(),
        name:  input.name.trim(),
        phone: input.phone.trim(),
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Sign up failed')
    }
    const data = await res.json()
    const newUser: User = {
      id:        data.user.id,
      name:      input.name.trim(),
      email:     data.user.email,
      phone:     input.phone.trim(),
      createdAt: data.user.createdAt,
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    if (data.profile) {
      await AsyncStorage.setItem('@fitroam:profile', JSON.stringify(data.profile))
    }
    setUser(newUser)
    return newUser
  }, [])

  // Sign in with email — returns user if exists, throws if not found
  const signIn = useCallback(async (email: string) => {
    const res = await fetch(`${API_BASE}/api/auth/signin`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: email.trim().toLowerCase() }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.error || 'Sign in failed')
    }
    const data = await res.json()
    const existingUser: User = {
      id:        data.user.id,
      name:      data.user.name || '',
      email:     data.user.email,
      phone:     data.user.phone || '',
      createdAt: data.user.createdAt,
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(existingUser))
    if (data.profile) {
      await AsyncStorage.setItem('@fitroam:profile', JSON.stringify(data.profile))
    }
    setUser(existingUser)
    return existingUser
  }, [])

  const update = useCallback(async (patch: Partial<Pick<User, 'name' | 'email' | 'phone'>>) => {
    if (!user) return null
    const next: User = {
      ...user,
      ...(patch.name  !== undefined && { name:  patch.name.trim() }),
      ...(patch.email !== undefined && { email: patch.email.trim().toLowerCase() }),
      ...(patch.phone !== undefined && { phone: patch.phone.trim() }),
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
    return next
  }, [user])

  const signOut = useCallback(async () => {
    setUser(null)
    await AsyncStorage.multiRemove([
      '@fitroam:user',
      '@fitroam:profile',
      '@fitroam:visits',
      '@fitroam:viewingLocation',
    ])
  }, [])

  const refresh = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      setUser(raw ? JSON.parse(raw) : null)
    } catch {}
  }, [])

  return (
    <UserContext.Provider value={{
      user,
      loading,
      isSignedIn: !!user,
      signUp,
      signIn,
      update,
      signOut,
      refresh,
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserContext must be used inside <UserProvider>')
  return ctx
}
