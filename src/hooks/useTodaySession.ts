import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = '@fitroam:todaySession'

export interface SessionEntry {
  date:    string   // YYYY-MM-DD
  session: string   // 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full_body' | 'rest' | 'custom'
  label?:  string   // for 'custom', the user-typed text
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useTodaySession() {
  const [entry,   setEntry]   = useState<SessionEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (!raw) {
        setEntry(null)
        return
      }
      const parsed: SessionEntry = JSON.parse(raw)
      // Only use it if it's for today
      if (parsed.date === today()) {
        setEntry(parsed)
      } else {
        setEntry(null)
      }
    } catch {
      setEntry(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const setSession = useCallback(async (session: string, label?: string) => {
    const next: SessionEntry = { date: today(), session, label }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setEntry(next)
  }, [])

  const clear = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY)
    setEntry(null)
  }, [])

  return { entry, loading, setSession, clear }
}
