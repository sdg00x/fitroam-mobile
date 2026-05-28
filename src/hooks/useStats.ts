import { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from 'expo-router'
import { useUserContext } from '../context/UserProvider'

const API_BASE = 'http://192.168.0.64:3000'

export interface Visit {
  id:           string
  gymId:        string
  gymName:      string
  gymAddress:   string
  accessType:   string
  status:       string
  visitedAt:    string
  confirmedAt:  string | null
}

export interface UserStats {
  sessions: number
  cities:   number
  visits:   Visit[]
  loading:  boolean
}

function extractCity(address: string): string {
  if (!address) return 'unknown'
  const parts = address.split(',').map(s => s.trim())
  if (parts.length >= 3) return parts[parts.length - 3].toLowerCase()
  if (parts.length >= 2) return parts[parts.length - 2].toLowerCase()
  return parts[0].toLowerCase()
}

export function useStats() {
  const [visits,  setVisits]  = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useUserContext()

  const load = useCallback(async () => {
    if (!user?.id) {
      setVisits([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/visits/all`, {
        headers: { 'x-user-id': user.id },
      })
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      // Filter out denied visits — they shouldn't appear in passport
      const filtered = (data.visits || []).filter((v: any) => v.status !== 'denied')
      setVisits(filtered)
    } catch (err) {
      console.warn('[useStats] load failed', err)
      setVisits([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const updateStatus = useCallback(async (visit: Visit, status: 'confirmed' | 'denied' | 'pending') => {
    if (!user?.id) return
    try {
      await fetch(`${API_BASE}/api/gyms/${visit.gymId}/visits/${visit.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body:    JSON.stringify({ status }),
      })
      // Optimistic: if denied, remove from list. Else update in place.
      if (status === 'denied') {
        setVisits(prev => prev.filter(v => v.id !== visit.id))
      } else {
        setVisits(prev => prev.map(v => v.id === visit.id ? { ...v, status } : v))
      }
    } catch (err) {
      console.warn('[useStats] updateStatus failed', err)
    }
  }, [user?.id])

  const remove = useCallback(async (visit: Visit) => {
    if (!user?.id) return
    try {
      await fetch(`${API_BASE}/api/gyms/${visit.gymId}/visits/${visit.id}`, {
        method:  'DELETE',
        headers: { 'x-user-id': user.id },
      })
      setVisits(prev => prev.filter(v => v.id !== visit.id))
    } catch (err) {
      console.warn('[useStats] remove failed', err)
    }
  }, [user?.id])

  const cities = new Set(visits.map(v => extractCity(v.gymAddress))).size

  return {
    sessions: visits.length,
    cities,
    visits,
    loading,
    updateStatus,
    remove,
    refresh: load,
  }
}
