import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const VISITS_KEY = '@fitroam:visits'

interface Visit {
  id:         string
  gymId:      string
  gymName:    string
  gymAddress: string
  accessType: string
  days:       number
  visitedAt:  string
}

export interface UserStats {
  sessions: number
  cities:   number
  visits:   Visit[]
  loading:  boolean
}

// Simple city extraction from address: take the last meaningful word before the postcode/country.
// Not perfect, fine for stats. Real data later replaces this with backend GymAccess records.
function extractCity(address: string): string {
  if (!address) return 'unknown'
  const parts = address.split(',').map(s => s.trim())
  // Usually the city is the second-to-last or third-to-last component
  if (parts.length >= 3) return parts[parts.length - 3].toLowerCase()
  if (parts.length >= 2) return parts[parts.length - 2].toLowerCase()
  return parts[0].toLowerCase()
}

export function useStats() {
  const [visits,  setVisits]  = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(VISITS_KEY)
      const list: Visit[] = raw ? JSON.parse(raw) : []
      setVisits(list)
    } catch {
      setVisits([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const cities = new Set(visits.map(v => extractCity(v.gymAddress))).size

  return {
    sessions: visits.length,
    cities,
    visits,
    loading,
    refresh: load,
  }
}
